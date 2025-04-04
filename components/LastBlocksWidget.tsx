import React, { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Image from "next/image";
import { useRouter } from "next/router";

import Hive from "@/types/Hive";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { cn } from "@/lib/utils";
import useMediaQuery from "@/hooks/common/useMediaQuery";
import useLastBlocks from "@/hooks/api/homePage/useLastBlocks";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { MoveRight } from "lucide-react";
import Link from "next/link";

interface LastBlocksWidgetProps {
  headBlock?: number;
  className?: string;
  strokeColor: string;
}

type ChartBlockData = {
  name: string;
  witness: string;
  comment: number;
  vote: number;
  custom: number;
  transfer: number;
  other: number;
  virtual: number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const totalOperations = payload.reduce((acc, pld) => acc + pld.value, 0);
    return (
      <div className="data-box">
        <p className="font-bold text-xl">{`Block ${label}`}</p>
        <div className="my-3 flex items-center">
          <Image
            className="rounded-full"
            src={getHiveAvatarUrl(payload[0].payload.witness)}
            alt="avatar"
            width={50}
            height={50}
          />
          <p className="ml-4 font-semibold">{payload[0].payload.witness}</p>
        </div>
        <div className="text-sm opacity-80">Operations: {totalOperations}</div>
        <div className="mt-2 space-y-2">
          {payload.map((pld, index) => (
            <div
              key={index}
              className="flex items-center"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: pld.fill }}
              />
              <span className="ml-2 text-sm">{`${pld.dataKey}: ${pld.value}`}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const getOpsCount = (lastBlocks: Hive.LastBlocksTypeResponse[]) => {
  const opsCount: ChartBlockData[] = lastBlocks.map((block) => ({
    name: block.block_num.toString(),
    witness: block.witness,
    virtual: 0,
    other: 0,
    comment: 0,
    custom: 0,
    vote: 0,
    transfer: 0,
  }));

  lastBlocks.forEach((block, index) => {
    let other = 0;
    let virtual = 0;
    block.ops_count.forEach((op) => {
      const typeId = op.op_type_id;
      if (typeId === 0) {
        opsCount[index].vote = op.count;
      } else if (typeId === 1) {
        opsCount[index].comment = op.count;
      } else if (typeId === 2) {
        opsCount[index].transfer = op.count;
      } else if (typeId === 18) {
        opsCount[index].custom = op.count;
      } else if (typeId >= 50) {
        virtual += op.count;
      } else {
        other += op.count;
      }
    });
    opsCount[index].other = other;
    opsCount[index].virtual = virtual;
  });
  return opsCount;
};

const LastBlocksWidget: React.FC<LastBlocksWidgetProps> = ({
  headBlock,
  className = "",
  strokeColor,
}) => {
  const [data, setData] = useState<ChartBlockData[]>([]);
  const router = useRouter();

  const lastBlocks = useLastBlocks(headBlock);

  useEffect(() => {
    setData(getOpsCount(lastBlocks.lastBlocksData || []).reverse());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(lastBlocks)]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const CustomBarLabel = useCallback(
    (props: any) => {
      const { viewBox, x, y, name } = props;
      const witness = lastBlocks.lastBlocksData?.find(
        (block) => block.block_num.toString() === name
      )?.witness;
      const size = viewBox.width * 1.5;
      return (
        <g
          id={`x=${x}, y=${y}`}
          onClick={() => router.push(`/@${witness}`)}
          className="cursor-pointer"
          data-testid="last-block-widget-user-link"
        >
          <defs>
            <clipPath id={`avatarCircle-${x}-${y}`}>
              <circle
                cx={x + viewBox.width / 2}
                cy={y - size / 2}
                r={viewBox.width / 1.75}
                fill="#ffffff"
              />
            </clipPath>
          </defs>
          <image
            x={x + viewBox.width / 2 - size / 2}
            y={y - size}
            dy={-6}
            width={size}
            height={size}
            href={getHiveAvatarUrl(witness)}
            clipPath={`url(#avatarCircle-${x}-${y})`}
          />
        </g>
      );
    },
    [lastBlocks.lastBlocksData, isMobile, router]
  );

  return (
    <Card
      className={cn("w-full h-[480px] pb-10", className)}
      data-testid="last-block-widget"
    >
      <CardHeader>
        <CardTitle>Last Blocks</CardTitle>
        <Link
              href="/blocks"
              className="text-sm flex items-center space-x-1 w-full text-center justify-center"
              data-testid="see-witnesses-link"
            >
              <span>See More</span>
              <MoveRight width={18} />
            </Link>
      </CardHeader>
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 55,
            left: isMobile ? 0 : 10,
            bottom: isMobile ? 120 : 90,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke={strokeColor}
            axisLine={false}
          ></XAxis>
          <YAxis
            stroke={strokeColor}
            axisLine={false}
            domain={[
              0,
              (dataMax: number) => (Math.floor((dataMax + 10) / 50) + 1) * 50,
            ]}
            allowDataOverflow={true}
            type="number"
            interval="preserveStartEnd"
          />
          <Tooltip
            cursor={{ fill: "#0000002A" }}
            content={<CustomTooltip />}
          />
          <Legend
            wrapperStyle={{ position: "relative", marginLeft: "35px" }}
            align="center"
          />
          <Bar
            dataKey="other"
            stackId="a"
            fill="#3a86ff"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="virtual"
            stackId="a"
            fill="#b010bf"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="comment"
            stackId="a"
            fill="#ffbe0b"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="custom"
            stackId="a"
            fill="#80003e"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="vote"
            stackId="a"
            fill="#fb5607"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="transfer"
            stackId="a"
            fill="#8338ec"
            label={<CustomBarLabel />}
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default LastBlocksWidget;
