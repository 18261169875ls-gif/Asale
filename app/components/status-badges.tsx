export function UnreadBadge({ count, dot = false }: { count?: number; dot?: boolean }) {
  if (!count && !dot) return null;
  return <span className={`wechat-unread ${!count ? "dot" : ""}`} aria-label={count ? `${count} 条未读消息` : "有新消息"}>{count || ""}</span>;
}

export function StageBadge({ stage }: { stage: string }) {
  return <span className={`stage-badge ${stage === "初步接触" ? "stage-prominent" : ""}`}>{stage}</span>;
}
