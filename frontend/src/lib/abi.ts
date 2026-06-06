export const CONCLAVE_ABI = [
  // ── Errors ──────────────────────────────────────────────────────────────────
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }, { internalType: "address", name: "agent", type: "address" }], name: "AlreadyVoted", type: "error" },
  { inputs: [{ internalType: "address", name: "agent", type: "address" }], name: "DuplicateAgent", type: "error" },
  { inputs: [], name: "EmptyTaskURI", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }, { internalType: "address", name: "agent", type: "address" }], name: "HasNotVoted", type: "error" },
  { inputs: [{ internalType: "uint8", name: "got", type: "uint8" }, { internalType: "uint8", name: "expected", type: "uint8" }], name: "InvalidEncryptedInput", type: "error" },
  { inputs: [], name: "InvalidQuorum", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }, { internalType: "address", name: "caller", type: "address" }], name: "NotRegisteredAgent", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }], name: "NotRoundCreator", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }, { internalType: "uint32", name: "submitted", type: "uint32" }, { internalType: "uint32", name: "required", type: "uint32" }], name: "QuorumNotMet", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }], name: "RevisionAlreadyOpen", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }, { internalType: "address", name: "agent", type: "address" }], name: "RevisionAlreadySubmitted", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }], name: "RevisionNotEnabled", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }], name: "RevisionNotOpen", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }], name: "RoundAlreadyFinalized", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }], name: "RoundAlreadyRevealed", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }], name: "RoundDoesNotExist", type: "error" },
  { inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }], name: "RoundNotFinalized", type: "error" },
  { inputs: [{ internalType: "uint32", name: "plaintext", type: "uint32" }, { internalType: "uint32", name: "max", type: "uint32" }], name: "ScoreOutOfRange", type: "error" },

  // ── Events ───────────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "roundId", type: "uint256" }, { indexed: false, internalType: "uint32", name: "consensusScore", type: "uint32" }],
    name: "ConsensusRevealed", type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "roundId", type: "uint256" }],
    name: "RevisionPhaseOpened", type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "roundId", type: "uint256" }, { indexed: true, internalType: "address", name: "agent", type: "address" }, { indexed: false, internalType: "uint32", name: "totalRevisions", type: "uint32" }],
    name: "RevisionSubmitted", type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "roundId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "uint32", name: "quorum", type: "uint32" },
      { indexed: false, internalType: "string", name: "taskURI", type: "string" },
      { indexed: false, internalType: "bool", name: "revisionsEnabled", type: "bool" },
    ],
    name: "RoundCreated", type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "roundId", type: "uint256" }],
    name: "RoundFinalized", type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "roundId", type: "uint256" }, { indexed: true, internalType: "address", name: "agent", type: "address" }, { indexed: false, internalType: "uint32", name: "totalSubmitted", type: "uint32" }],
    name: "VoteSubmitted", type: "event",
  },

  // ── Functions ────────────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "address[]", name: "agents", type: "address[]" },
      { internalType: "string", name: "taskURI", type: "string" },
      { internalType: "bool", name: "revisionsEnabled", type: "bool" },
    ],
    name: "createRound",
    outputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }],
    stateMutability: "nonpayable", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }],
    name: "finalizeRound", outputs: [], stateMutability: "nonpayable", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }],
    name: "getAgents",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }],
    name: "getConsensusHandle",
    outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
    stateMutability: "view", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }],
    name: "getMyScoreHandle",
    outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
    stateMutability: "view", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }],
    name: "getRound",
    outputs: [
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "string", name: "taskURI", type: "string" },
      { internalType: "uint32", name: "quorum", type: "uint32" },
      { internalType: "uint32", name: "votesSubmitted", type: "uint32" },
      { internalType: "uint32", name: "revisionsSubmitted", type: "uint32" },
      { internalType: "bool", name: "revisionsEnabled", type: "bool" },
      { internalType: "uint8", name: "phase", type: "uint8" },
      { internalType: "uint32", name: "consensusScore", type: "uint32" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "uint256", name: "finalizedAt", type: "uint256" },
      { internalType: "uint256", name: "revealedAt", type: "uint256" },
    ],
    stateMutability: "view", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }, { internalType: "address", name: "agent", type: "address" }],
    name: "hasRevised",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }, { internalType: "address", name: "agent", type: "address" }],
    name: "hasVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }, { internalType: "address", name: "agent", type: "address" }],
    name: "isAgent",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view", type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }],
    name: "openRevisionPhase", outputs: [], stateMutability: "nonpayable", type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "roundId", type: "uint256" },
      { internalType: "euint32", name: "ctHash", type: "bytes32" },
      { internalType: "uint32", name: "plaintext", type: "uint32" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "revealConsensus", outputs: [], stateMutability: "nonpayable", type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "roundId", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "ctHash", type: "uint256" },
          { internalType: "uint8", name: "securityZone", type: "uint8" },
          { internalType: "uint8", name: "utype", type: "uint8" },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct InEuint32",
        name: "newEncryptedScore",
        type: "tuple",
      },
    ],
    name: "reviseVote", outputs: [], stateMutability: "nonpayable", type: "function",
  },
  {
    inputs: [],
    name: "roundCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view", type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "roundId", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "ctHash", type: "uint256" },
          { internalType: "uint8", name: "securityZone", type: "uint8" },
          { internalType: "uint8", name: "utype", type: "uint8" },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct InEuint32",
        name: "encryptedScore",
        type: "tuple",
      },
    ],
    name: "submitVote", outputs: [], stateMutability: "nonpayable", type: "function",
  },
] as const;
