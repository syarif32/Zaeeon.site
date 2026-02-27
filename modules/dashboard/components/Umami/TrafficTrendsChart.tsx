"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface DataPoint {
  x: string;
  y: number;
}

interface DataProps {
  data: {
    pageviews: DataPoint[];
    sessions: DataPoint[];
  };
}

const TrafficTrendsChart = ({ data }: DataProps) => {
  const rawLabels = data?.pageviews?.map((point) => point.x) || [];
  
  // 1. BIAR LANGSING: Ubah format label dari "MMM" (Bulan) ke "dd MMM" (Tanggal)
  const labels = rawLabels?.map((isoDate) => format(parseISO(isoDate), "dd MMM"));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sessions",
        data: data?.sessions?.map((point) => point.y) || [],
        // 2. BIAR BIRU: Gunakan warna biru yang lebih gelap/soft untuk Sessions
        backgroundColor: "rgba(59, 130, 246, 0.5)", 
        stack: "traffic",
        borderRadius: 4,
        barPercentage: 0.5, // 3. BIAR GAK GENDUT: Perkecil lebar batang
      },
      {
        label: "Page views",
        data: data?.pageviews?.map((point) => point.y) || [],
        // 4. BIAR BIRU: Gunakan warna biru solid untuk Page Views
        backgroundColor: "rgba(37, 99, 235, 1)", 
        stack: "traffic",
        borderRadius: 4,
        barPercentage: 0.5, // 3. BIAR GAK GENDUT: Perkecil lebar batang
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const isoDate = rawLabels[index];
            // 5. TOOLTIP: Tampilkan format tanggal lengkap saat di-hover
            return isoDate ? format(parseISO(isoDate), "dd MMMM yyyy") : "";
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        // 6. BIAR RAPI: Batasi jumlah label yang muncul di sumbu X agar tidak tabrakan
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10, 
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Biar ada garis tipis di background
        }
      },
    },
  };

  return (
    <div className="h-[300px] w-full md:h-[350px]"> {/* Tinggi dikurangi sedikit agar proporsional */}
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TrafficTrendsChart;