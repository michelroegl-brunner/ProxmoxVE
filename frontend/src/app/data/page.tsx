"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/lib/types";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const defaultLogo = "/default-logo.png"; // Fallback logo path
const MAX_DESCRIPTION_LENGTH = 100; // Set max length for description
const MAX_LOGOS = 5; // Max logos to display at once

const formattedBadge = (type: string) => {
  switch (type) {
    case "vm":
      return <Badge className="text-blue-500/75 border-blue-500/75 badge">VM</Badge>;
    case "ct":
      return (
        <Badge className="text-yellow-500/75 border-yellow-500/75 badge">LXC</Badge>
      );
    case "misc":
      return <Badge className="text-green-500/75 border-green-500/75 badge">MISC</Badge>;
  }
  return null;
};

interface DataModel {
  id: number;
  ct_type: number;
  disk_size: number;
  core_count: number;
  ram_size: number;
  verbose: string;
  os_type: string;
  os_version: string;
  hn: string;
  disableip6: string;
  ssh: string;
  tags: string;
  nsapp: string;
  created_at: string;
  method: string;
}

const DataFetcher: React.FC = () => {
  const [data, setData] = useState<DataModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DataModel | null, direction: 'ascending' | 'descending' }>({ key: 'id', direction: 'ascending' });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://api.htl-braunau.at/data/json");
        if (!response.ok) throw new Error("Failed to fetch data: ${response.statusText}");
        const result: DataModel[] = await response.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const filteredData = data.filter(item => {
    const matchesSearchQuery = Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    const itemDate = new Date(item.created_at);
    const matchesDateRange = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
    return matchesSearchQuery && matchesDateRange;
  });

  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        if (sortConfig.key !== null && a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (sortConfig.key !== null && a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const requestSort = (key: keyof DataModel) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  interface SortConfig {
    key: keyof DataModel | null;
    direction: 'ascending' | 'descending';
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const timezoneOffset = dateString.slice(-6);
    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds} ${timezoneOffset} GMT`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  return (
    <div className="p-6 mt-20">
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="mb-4 p-2 border"
        />

        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start date"
          className="p-2 border"
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="End date"
          className="p-2 border"
        />
      </div>
      <p className="text-lg font-bold mb-4">{sortedData.length} results found</p>
      <div className="overflow-x-auto">
        <div className="overflow-y-auto lg:overflow-y-visible">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('nsapp')}>Application</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('os_type')}>OS</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('os_version')}>OS Version</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('disk_size')}>Disk Size</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('core_count')}>Core Count</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('ram_size')}>RAM Size</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('hn')}>Hostname</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('ssh')}>SSH</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('verbose')}>Verbose</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('tags')}>Tags</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('method')}>Method</th>
                <th className="px-4 py-2 border-b cursor-pointer" onClick={() => requestSort('created_at')}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border-b">{item.nsapp}</td>
                  <td className="px-4 py-2 border-b">{item.os_type}</td>
                  <td className="px-4 py-2 border-b">{item.os_version}</td>
                  <td className="px-4 py-2 border-b">{item.disk_size}</td>
                  <td className="px-4 py-2 border-b">{item.core_count}</td>
                  <td className="px-4 py-2 border-b">{item.ram_size}</td>
                  <td className="px-4 py-2 border-b">{item.hn}</td>
                  <td className="px-4 py-2 border-b">{item.ssh}</td>
                  <td className="px-4 py-2 border-b">{item.verbose}</td>
                  <td className="px-4 py-2 border-b">{item.tags.replace(/;/g, ' ')}</td>
                  <td className="px-4 py-2 border-b">{item.method}</td>
                  <td className="px-4 py-2 border-b">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



export default DataFetcher;
