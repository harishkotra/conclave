// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract Conclave {

    error RoundDoesNotExist(uint256 roundId);
    error InvalidQuorum();
    error EmptyTaskURI();
    error DuplicateAgent(address agent);
    error NotRegisteredAgent(uint256 roundId, address caller);
    error NotRoundCreator(uint256 roundId);
    error AlreadyVoted(uint256 roundId, address agent);
    error HasNotVoted(uint256 roundId, address agent);
    error RoundAlreadyFinalized(uint256 roundId);
    error RoundNotFinalized(uint256 roundId);
    error RoundAlreadyRevealed(uint256 roundId);
    error QuorumNotMet(uint256 roundId, uint32 submitted, uint32 required);
    error ScoreOutOfRange(uint32 plaintext, uint32 max);
    error RevisionNotOpen(uint256 roundId);
    error RevisionAlreadyOpen(uint256 roundId);
    error RevisionAlreadySubmitted(uint256 roundId, address agent);
    error RevisionNotEnabled(uint256 roundId);

    event RoundCreated(
        uint256 indexed roundId,
        address indexed creator,
        uint32  quorum,
        string  taskURI,
        bool    revisionsEnabled
    );

    event VoteSubmitted(
        uint256 indexed roundId,
        address indexed agent,
        uint32  totalSubmitted
    );

    event RevisionPhaseOpened(uint256 indexed roundId);

    event RevisionSubmitted(
        uint256 indexed roundId,
        address indexed agent,
        uint32  totalRevisions
    );

    event RoundFinalized(uint256 indexed roundId);

    event ConsensusRevealed(uint256 indexed roundId, uint32 consensusScore);

    enum Phase { Voting, Revision, Finalized, Revealed }

    struct Round {
        address creator;
        string  taskURI;
        uint32  quorum;
        uint32  votesSubmitted;
        uint32  revisionsSubmitted;
        bool    revisionsEnabled;
        Phase   phase;
        euint32 encryptedSum;
        euint32 encryptedCount;
        euint32 consensusHandle;
        uint32  consensusScore;
        uint256 createdAt;
        uint256 finalizedAt;
        uint256 revealedAt;
    }

    uint32 public constant MAX_AGENTS = 50;
    uint32 public constant MAX_SCORE  = 100;

    uint256 public roundCount;

    mapping(uint256 => Round)                        private _rounds;
    mapping(uint256 => address[])                    private _roundAgents;
    mapping(uint256 => mapping(address => bool))     private _isAgent;
    mapping(uint256 => mapping(address => bool))     private _hasVoted;
    mapping(uint256 => mapping(address => bool))     private _hasRevised;
    mapping(uint256 => mapping(address => euint32))  private _agentScoreHandle;

    function createRound(
        address[] calldata agents,
        string    calldata taskURI,
        bool               revisionsEnabled
    ) external returns (uint256 roundId) {
        if (agents.length < 2 || agents.length > MAX_AGENTS)
            revert InvalidQuorum();

        if (bytes(taskURI).length == 0)
            revert EmptyTaskURI();

        for (uint256 i = 0; i < agents.length; i++) {
            for (uint256 j = i + 1; j < agents.length; j++) {
                if (agents[i] == agents[j])
                    revert DuplicateAgent(agents[i]);
            }
        }

        roundId = ++roundCount;
        Round storage r = _rounds[roundId];

        r.creator            = msg.sender;
        r.taskURI            = taskURI;
        r.quorum             = uint32(agents.length);
        r.createdAt          = block.timestamp;
        r.revisionsEnabled   = revisionsEnabled;
        r.phase              = Phase.Voting;

        r.encryptedSum   = FHE.asEuint32(0);
        r.encryptedCount = FHE.asEuint32(0);

        FHE.allowThis(r.encryptedSum);
        FHE.allowThis(r.encryptedCount);

        for (uint256 i = 0; i < agents.length; i++) {
            _roundAgents[roundId].push(agents[i]);
            _isAgent[roundId][agents[i]] = true;
        }

        emit RoundCreated(roundId, msg.sender, r.quorum, taskURI, revisionsEnabled);
    }

    function submitVote(
        uint256   roundId,
        InEuint32 calldata encryptedScore
    ) external {
        _requireRoundExists(roundId);

        Round storage r = _rounds[roundId];

        if (!_isAgent[roundId][msg.sender])
            revert NotRegisteredAgent(roundId, msg.sender);
        if (_hasVoted[roundId][msg.sender])
            revert AlreadyVoted(roundId, msg.sender);
        if (r.phase != Phase.Voting)
            revert RoundAlreadyFinalized(roundId);

        euint32 score = FHE.asEuint32(encryptedScore);

        FHE.allow(score, msg.sender);
        FHE.allowThis(score);

        _agentScoreHandle[roundId][msg.sender] = score;

        euint32 newSum = FHE.add(r.encryptedSum, score);
        FHE.allowThis(newSum);
        r.encryptedSum = newSum;

        euint32 newCount = FHE.add(r.encryptedCount, FHE.asEuint32(1));
        FHE.allowThis(newCount);
        r.encryptedCount = newCount;

        r.votesSubmitted++;
        _hasVoted[roundId][msg.sender] = true;

        emit VoteSubmitted(roundId, msg.sender, r.votesSubmitted);
    }

    function openRevisionPhase(uint256 roundId) external {
        _requireRoundExists(roundId);

        Round storage r = _rounds[roundId];

        if (r.creator != msg.sender)
            revert NotRoundCreator(roundId);
        if (!r.revisionsEnabled)
            revert RevisionNotEnabled(roundId);
        if (r.phase != Phase.Voting)
            revert RevisionAlreadyOpen(roundId);
        if (r.votesSubmitted < r.quorum)
            revert QuorumNotMet(roundId, r.votesSubmitted, r.quorum);

        r.phase = Phase.Revision;

        emit RevisionPhaseOpened(roundId);
    }

    function reviseVote(
        uint256   roundId,
        InEuint32 calldata newEncryptedScore
    ) external {
        _requireRoundExists(roundId);

        Round storage r = _rounds[roundId];

        if (!_isAgent[roundId][msg.sender])
            revert NotRegisteredAgent(roundId, msg.sender);
        if (!_hasVoted[roundId][msg.sender])
            revert HasNotVoted(roundId, msg.sender);
        if (r.phase != Phase.Revision)
            revert RevisionNotOpen(roundId);
        if (_hasRevised[roundId][msg.sender])
            revert RevisionAlreadySubmitted(roundId, msg.sender);

        euint32 oldScore = _agentScoreHandle[roundId][msg.sender];
        euint32 newScore = FHE.asEuint32(newEncryptedScore);

        FHE.allow(newScore, msg.sender);
        FHE.allowThis(newScore);

        euint32 sumAfterRemoval = FHE.sub(r.encryptedSum, oldScore);
        FHE.allowThis(sumAfterRemoval);

        euint32 newSum = FHE.add(sumAfterRemoval, newScore);
        FHE.allowThis(newSum);
        r.encryptedSum = newSum;

        _agentScoreHandle[roundId][msg.sender] = newScore;
        _hasRevised[roundId][msg.sender] = true;
        r.revisionsSubmitted++;

        emit RevisionSubmitted(roundId, msg.sender, r.revisionsSubmitted);
    }

    function finalizeRound(uint256 roundId) external {
        _requireRoundExists(roundId);

        Round storage r = _rounds[roundId];

        if (r.phase == Phase.Finalized || r.phase == Phase.Revealed)
            revert RoundAlreadyFinalized(roundId);

        if (r.phase == Phase.Voting) {
            if (r.votesSubmitted < r.quorum)
                revert QuorumNotMet(roundId, r.votesSubmitted, r.quorum);
        }

        euint32 avg = FHE.div(r.encryptedSum, r.encryptedCount);

        FHE.allowThis(avg);
        FHE.allow(avg, r.creator);
        FHE.allowPublic(avg);

        r.consensusHandle = avg;
        r.phase           = Phase.Finalized;
        r.finalizedAt     = block.timestamp;

        emit RoundFinalized(roundId);
    }

    function revealConsensus(
        uint256 roundId,
        euint32 ctHash,
        uint32  plaintext,
        bytes calldata signature
    ) external {
        _requireRoundExists(roundId);

        Round storage r = _rounds[roundId];

        if (r.phase != Phase.Finalized)
            revert RoundNotFinalized(roundId);
        if (plaintext > MAX_SCORE)
            revert ScoreOutOfRange(plaintext, MAX_SCORE);

        FHE.publishDecryptResult(ctHash, plaintext, signature);

        r.consensusScore = plaintext;
        r.phase          = Phase.Revealed;
        r.revealedAt     = block.timestamp;

        emit ConsensusRevealed(roundId, plaintext);
    }

    function getRound(uint256 roundId)
        external view
        returns (
            address creator,
            string memory taskURI,
            uint32  quorum,
            uint32  votesSubmitted,
            uint32  revisionsSubmitted,
            bool    revisionsEnabled,
            Phase   phase,
            uint32  consensusScore,
            uint256 createdAt,
            uint256 finalizedAt,
            uint256 revealedAt
        )
    {
        _requireRoundExists(roundId);
        Round storage r = _rounds[roundId];
        return (
            r.creator,
            r.taskURI,
            r.quorum,
            r.votesSubmitted,
            r.revisionsSubmitted,
            r.revisionsEnabled,
            r.phase,
            r.consensusScore,
            r.createdAt,
            r.finalizedAt,
            r.revealedAt
        );
    }

    function getConsensusHandle(uint256 roundId)
        external view returns (euint32)
    {
        _requireRoundExists(roundId);
        Round storage r = _rounds[roundId];
        if (r.phase != Phase.Finalized && r.phase != Phase.Revealed)
            revert RoundNotFinalized(roundId);
        return r.consensusHandle;
    }

    function getMyScoreHandle(uint256 roundId)
        external view returns (euint32)
    {
        _requireRoundExists(roundId);
        if (!_isAgent[roundId][msg.sender])
            revert NotRegisteredAgent(roundId, msg.sender);
        if (!_hasVoted[roundId][msg.sender])
            revert HasNotVoted(roundId, msg.sender);
        return _agentScoreHandle[roundId][msg.sender];
    }

    function getAgents(uint256 roundId)
        external view returns (address[] memory)
    {
        _requireRoundExists(roundId);
        return _roundAgents[roundId];
    }

    function hasVoted(uint256 roundId, address agent)
        external view returns (bool)
    {
        _requireRoundExists(roundId);
        return _hasVoted[roundId][agent];
    }

    function hasRevised(uint256 roundId, address agent)
        external view returns (bool)
    {
        _requireRoundExists(roundId);
        return _hasRevised[roundId][agent];
    }

    function isAgent(uint256 roundId, address agent)
        external view returns (bool)
    {
        _requireRoundExists(roundId);
        return _isAgent[roundId][agent];
    }

    function _requireRoundExists(uint256 roundId) internal view {
        if (roundId == 0 || roundId > roundCount)
            revert RoundDoesNotExist(roundId);
    }
}
