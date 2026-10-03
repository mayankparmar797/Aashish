import React from "react";
import { CaseReplayTimeline } from "./CaseReplayTimeline";

interface Props {
  onSelectVictim: (accountId: string) => void;
  onGenerateNotice: (accountId: string) => void;
  onGenerateDiary?: (accountId: string) => void;
}

/**
 * BlindVictimSuite has been replaced by the comprehensive 4-Hop Case Replay & Timeline
 * with live simultaneous correlation graph and node banking forensics.
 */
export const BlindVictimSuite: React.FC<Props> = (props) => {
  return <CaseReplayTimeline {...props} />;
};

export default BlindVictimSuite;
