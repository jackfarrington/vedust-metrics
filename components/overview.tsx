import { type Portfolio } from "@/lib/portfolio";
import { formatNumber } from "@/lib/util";

type OverviewProps = {
  readonly dustPrice: number;
  readonly portfolio: Portfolio;
  readonly usdcRewards: number;
  readonly totalPower: number;
};

export default async function Overview({
  dustPrice,
  portfolio,
  usdcRewards,
  totalPower,
} : OverviewProps) {
  const { dustUnits, powerUnits } = portfolio.locks.reduce(({ dustUnits, powerUnits }, next) => {
    return {
      dustUnits: dustUnits + next.amount,
      powerUnits: powerUnits + next.votingPower,
    }
  }, { dustUnits: 0n, powerUnits: 0n });
  const dustLocked = Number(dustUnits) / 10**18;
  const totalDust = portfolio.dust.held + portfolio.dust.accrued + dustLocked;
  const netAccountValue = totalDust * dustPrice;
  const pendingLockRewards = usdcRewards * Number(powerUnits) / 10**18 / totalPower;

  return (
    <div className="font-body rounded-xl p-3 border border-purple-100 shadow-sm bg-purple-50">
      <h3 className="flex justify-center text-xl font-medium text-purple-800 font-heading">Overview</h3>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-purple-800">DUST</p>
          <p className="text-sm text-purple-500">${formatNumber(dustPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-purple-800">Held</p>
          <p className="text-sm text-purple-500">{formatNumber(portfolio.dust.held, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}<span className="text-xs"> ≈ ${formatNumber(portfolio.dust.held * dustPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        </div>
        <div className="flex flex-col justify-between">
          <p className="text-sm font-medium text-purple-800">Accrued</p>
          <p className="text-sm text-purple-500">{formatNumber(portfolio.dust.accrued, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-xs"> ≈ ${formatNumber(portfolio.dust.accrued * dustPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        </div>
        <div className="flex flex-col justify-between">
          <p className="text-sm font-medium text-purple-800">Locked</p>
          <p className="text-sm text-purple-500">{formatNumber(dustLocked, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}<span className="text-xs"> ≈ ${formatNumber(dustLocked * dustPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        </div>
        <div>
          <p className="text-sm font-medium text-purple-800">Total Value</p>
          <p className="text-sm text-purple-500">${formatNumber(netAccountValue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-purple-800">Epoch Earnings</p>
          <p className={`text-sm text-purple-500`}>~${formatNumber(pendingLockRewards, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
    </div>
  );
}