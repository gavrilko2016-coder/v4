export const RTP = {
  COIN_FLIP: 0.99,
  DICE: 0.99,
  LIMBO: 0.99,
  CRASH: 0.97,
  SLOTS: 0.96,
  DIAMOND_MINES: 0.98,
  BLACKJACK: 0.985,
} as const;

export function houseEdge(rtp: number): number {
  return 1 - rtp;
}
