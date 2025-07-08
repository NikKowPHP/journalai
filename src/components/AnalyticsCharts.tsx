"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

const AnalyticsCharts: React.FC = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [topicChartData, setTopicChartData] = useState<ChartData | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState("30_days");
  const [selectedQuestionType, setSelectedQuestionType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/progress");
        if (!response.ok) {
          throw new Error("Failed to load analytics data");
        }
        const data = await response.json();
        const metrics = data.metrics;
        const topicMetrics = data.analytics;

        // Generate sample data for demonstration based on selected filters
        let days: number;
        switch (selectedDateRange) {
          case "7_days":
            days = 7;
            break;
          case "14_days":
            days = 14;
            break;
          case "30_days":
            days = 30;
            break;
          default:
            days = 30;
        }

        const accuracyData = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toLocaleDateString(),
            accuracy: Math.random() * (metrics.masteryScore / 100),
          };
        });

        setChartData({
          labels: accuracyData.map((d) => d.date),
          datasets: [
            {
              label: `Accuracy Over Time (${selectedQuestionType === "all" ? "All Types" : selectedQuestionType})`,
              data: accuracyData.map((d) => d.accuracy * 100),
              borderColor: "rgba(75, 192, 192, 1)",
              fill: false,
            },
          ],
        });

        interface TopicMasteryData {
          topic_id: string;
          mastery_level: number;
        }

        if (topicMetrics?.topicMastery?.length) {
          setTopicChartData({
            labels: topicMetrics.topicMastery.map(
              (t: TopicMasteryData) => t.topic_id,
            ),
            datasets: [
              {
                label: "Mastery by Topic",
                data: topicMetrics.topicMastery.map(
                  (t: TopicMasteryData) => t.mastery_level,
                ),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
              },
            ],
          });
        }
      } catch (err) {
        setError("Failed to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedDateRange, selectedQuestionType]);

  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!chartData) {
    return <div>No analytics data available.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Filters</h3>
        <div className="flex space-x-4">
          <div>
            <label className="block mb-1">Date Range:</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="border rounded p-2"
            >
              <option value="7_days">Last 7 Days</option>
              <option value="14_days">Last 14 Days</option>
              <option value="30_days">Last 30 Days</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Question Type:</label>
            <select
              value={selectedQuestionType}
              onChange={(e) => setSelectedQuestionType(e.target.value)}
              className="border rounded p-2"
            >
              <option value="all">All Types</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Accuracy Over Time</h3>
          <Line data={chartData} />
        </div>
        {topicChartData && (
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">
              Strengths & Weaknesses by Topic
            </h3>
            <Bar data={topicChartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCharts;
