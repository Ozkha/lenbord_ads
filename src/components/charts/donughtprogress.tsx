"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

enum COLORS {
  "fail" = "#fe0000",
  "success" = "#00C49F",
  "mid" = "#FF8042",
  "disabled" = "#71717a",
  "empty" = "#cbd5e1",
}

const RADIAN = Math.PI / 180;

type renderCustomizedLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
};
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  index,
}: renderCustomizedLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.8;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      fontSize={11}
      x={x}
      y={y}
      fill="gray"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(index + 1).toFixed(0)}`}
    </text>
  );
};

type DonughtProgressProps = {
  data: {
    status: "success" | "fail" | "mid" | "disabled" | "empty" | null;
    fieldValues: number[];
    day: number;
  }[];
  maxLength: number;
  title: string;
  onClickCell?: (index: number) => void;
};
export default function DonughtProgress({
  data,
  title,
  maxLength,
  onClickCell,
}: DonughtProgressProps) {
  // eslint-disable-next-line prefer-const
  let finalData: {
    label: string;
    state: "success" | "fail" | "mid" | "disabled" | "empty";
    value: number;
  }[] = [];

  for (let i = 0; i < maxLength; i++) {
    const val = data.find((dayData) => i + 1 === dayData.day);
    if (val) {
      if (val.status == null) val.status = "empty";
      finalData[i] = { label: "day " + val.day, state: val.status, value: 10 };
    } else {
      finalData[i] = { label: "day " + i + 1, state: "empty", value: 10 };
    }
  }

  return (
    <ResponsiveContainer width={"100%"} height={275}>
      <PieChart height={275}>
        <Pie
          data={finalData}
          labelLine={false}
          label={renderCustomizedLabel}
          innerRadius={55}
          outerRadius={135}
          fill="#8884d8"
          paddingAngle={2}
          dataKey={"value"}
        >
          {finalData.map((entry, index) => (
            <Cell
              className="cursor-pointer"
              onClick={onClickCell ? () => onClickCell(index + 1) : undefined}
              key={`cell-${index}`}
              fill={COLORS[entry.state]}
            />
          ))}
          <Label value={title} position={"center"} />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
