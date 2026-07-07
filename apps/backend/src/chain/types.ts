export interface SubmissionJobData {
  checkId: string;
  fixtureId: string;
  marketSet: string[];
  summedImpliedProbability: number;
  isConsistent: boolean;
  margin: number;
}

export interface SubmissionJobResult {
  signature: string;
  slot: number;
  blockTime: number | null;
}

export interface OracleConfig {
  programId: string;
  cluster: 'devnet' | 'testnet' | 'mainnet-beta';
  rpcUrl: string;
}
