"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ApplicationChart from "../../components/ApplicationChart";
import FilterComponent from "../../components/FilterComponent";
import { AlertCircle } from "lucide-react"; // Modernes Icon für Fehler
import { set } from "date-fns";

interface DataModel {
  id: number;
  ct_type: number;
  disk_size: number;
  core_count: number;
  ram_size: number;
  os_type: string;
  os_version: string;
  disableip6: string;
  nsapp: string;
  created_at: string;
  method: string;
  pve_version: string;
  status: string;
  error: string;
  type: string;
}

interface Summary {
  total_entries: number;
  status_count: {
    [key: string]: number;
  };
  nsapp_count: {
    [key: string]: number;
  };
}

const DataFetcher: React.FC = () => {
  const [data, setData] = useState<DataModel[]>([]);
  const [data_summary, setSummary] = useState<Summary[]>([]);
  const [filteredData, setFilteredData] = useState<DataModel[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [installingCounts, setInstallingCounts] = useState(0);
  const [failedCounts, setFailedCounts] = useState(0);
  const [doneCounts, setDoneCounts] = useState(0);
  const [unknownCounts, setUnknownCounts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Track total items from API

  const handleLoadMore = () => {
    console.log(currentPage)
    setCurrentPage((prev) => prev + 1);
    setItemsPerPage((prev) => prev + 5);
    console.log(currentPage)
    fetchData();
  };

  const handleShowError = (event: React.MouseEvent, errorMessage: string) => {
    setErrorPopup({
      open: true,
      message: errorMessage,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleCloseError = () => {
    setErrorPopup({ open: false, message: "", x: 0, y: 0 });
  };
  const [errorPopup, setErrorPopup] = useState<{ open: boolean; message: string; x: number; y: number }>({
    open: false,
    message: "",
    x: 0,
    y: 0,
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };
  const filteredCounts = {
    installing: filteredData.filter(item => item.status === "installing").length,
    done: filteredData.filter(item => item.status === "done").length,
    failed: filteredData.filter(item => item.status === "failed").length,
    unknown: filteredData.filter(item => !["installing", "done", "failed"].includes(item.status)).length,
  };


  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return <span className="text-gray-400">▲▼</span>;
    return sortDirection === "asc" ? (
      <span className="text-gray-400">▲</span>
    ) : (
      <span className="text-gray-400">▼</span>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://10.5.146.10:8080/data/paginated?page=${currentPage}&limit=${itemsPerPage}`);
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
        const result: DataModel[] = await response.json();
        setData(result);
        setFilteredData(result);

        const response_summary = await fetch(`http://10.5.146.10:8080/data/summary`);
      if (!response_summary.ok) throw new Error(`Failed to fetch data: ${response_summary.statusText}`);
      const data_summary: Summary = await response_summary.json();
      setSummary([data_summary]); // Wrap the object in an array to maintain consistency

      let installing = 0,
        failed = 0,
        done = 0,
        unknown = 0;

      Object.entries(data_summary.status_count).forEach(([status, count]) => {
        if (status === "installing") installing += count;
        else if (status === "done") done += count;
        else if (status === "failed") failed += count;
        else unknown += count;
      });

      
      // Update your state or perform other actions with the counts
      setInstallingCounts(installing);
      setFailedCounts(failed);
      setDoneCounts(done);
      setUnknownCounts(unknown);

      setTotalItems(data_summary.total_entries);

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setItemsPerPage((prev) => (prev < filteredData.length ? prev + 25 : prev));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredData]);

  const applyFilters = async (column: string, operator: string, value: any) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      if (!updatedFilters[column]) updatedFilters[column] = [];

      const alreadyExists = updatedFilters[column].some((filter: { operator: string; value: any }) =>
        filter.operator === operator && filter.value === value
      );

      if (!alreadyExists) {
        updatedFilters[column].push({ operator, value });
      }

      return updatedFilters;
    });
  };

  const removeFilter = (column: string, index: number) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      updatedFilters[column] = updatedFilters[column].filter((_: any, i: number) => i !== index);
      if (updatedFilters[column].length === 0) delete updatedFilters[column];
      return updatedFilters;
    });
  };

  useEffect(() => {
    let sortedAndFilteredData = [...data];

    // Filtering
    sortedAndFilteredData = sortedAndFilteredData.filter((item) => {
      const matchesSearchQuery = Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
      const itemDate = new Date(item.created_at);
      const matchesDateRange = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      return matchesSearchQuery && matchesDateRange;
    });

    Object.keys(filters).forEach((key) => {
      if (!filters[key] || filters[key].length === 0) return;

      sortedAndFilteredData = sortedAndFilteredData.filter((item) => {
        const itemValue = item[key as keyof DataModel];

        return filters[key].some(({ operator, value }: { operator: string; value: any }) => {
          if (typeof itemValue === "number") {
            value = parseFloat(value);
            if (operator === "greater") return itemValue > value;
            if (operator === "greater or equal") return itemValue >= value;
            if (operator === "less") return itemValue < value;
            if (operator === "less or equal") return itemValue <= value;
          }

          if (typeof itemValue === "string") {
            if (operator === "equals") return itemValue.toLowerCase() === value.toLowerCase();
            if (operator === "not equals") return itemValue.toLowerCase() !== value.toLowerCase();
            if (operator === "contains") return itemValue.toLowerCase().includes(value.toLowerCase());
            if (operator === "does not contain") return !itemValue.toLowerCase().includes(value.toLowerCase());
          }

          return false;
        });
      });
    });
    const filteredCounts = {
      installing: filteredData.filter(item => item.status === "installing").length,
      done: filteredData.filter(item => item.status === "done").length,
      failed: filteredData.filter(item => item.status === "failed").length,
      unknown: filteredData.filter(item => !["installing", "done", "failed"].includes(item.status)).length,
    };

    // Sortieren
    if (sortColumn) {
      sortedAndFilteredData.sort((a, b) => {
        const valA = a[sortColumn as keyof DataModel];
        const valB = b[sortColumn as keyof DataModel];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
        if (typeof valA === "string" && typeof valB === "string") {
          return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
    }

    // Daten sofort aktualisieren
    setFilteredData(sortedAndFilteredData);
  }, [filters, data, searchQuery, startDate, endDate, sortColumn, sortDirection]);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const columns = [
    { key: "status", type: "text", label: "Status" },
    { key: "type", type: "text", label: "Type" },
    { key: "nsapp", type: "text", label: "App" },
    { key: "os_type", type: "text", label: "OS" },
    { key: "disk_size", type: "number", label: "HDD" },
    { key: "core_count", type: "number", label: "Cores" },
    { key: "ram_size", type: "number", label: "RAM" },
    { key: "method", type: "text", label: "Method" },
    { key: "pve_version", type: "text", label: "Version" },
    { key: "error", type: "text", label: "Error" },
    { key: "created_at", type: "text", label: "Created" }
  ];
  console.log (data_summary[0]?.nsapp_count);
  return (
    <div className="p-6 mt-20 max-w-full">

      <h1 className="text-2xl font-bold mb-4 text-center">Created LXCs - {totalItems} Installations</h1>
      
      <ApplicationChart data={data_summary[0]?.nsapp_count} />
      <br></br>

      {/* Search & Date Filters */}
      <div className="mb-4 flex space-x-4 w-full">
        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="p-2 border" />
        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start date" className="p-2 border" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End date" className="p-2 border" />
      </div>

      <br></br>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-lg font">
          Status Legend: 🔄 installing {installingCounts} | ✔️ completed {doneCounts} | ❌ failed {failedCounts} | ❓ unknown {unknownCounts}
        </p>
      </div>

      <div className="max-w-screen-2xl mx-auto overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-600">
          <thead>
            <tr className="bg-gray-800 text-white">
              {columns.map(({ key, type, label }) => (
                <th key={key} className="px-4 py-3 border border-gray-600 text-left whitespace-nowrap">
                  <div className="flex items-center justify-start">
                    {/* Filter-Icon links */}
                    {key !== "created_at" && (
                      <div className="mr-2">
                        <FilterComponent
                          column={key}
                          type={columns.find(col => col.key === key)?.type as "text" | "number" || "text"}
                          activeFilters={filters[key] || []}
                          onApplyFilter={applyFilters}
                          onRemoveFilter={removeFilter}
                          allData={data}
                        />
                      </div>
                    )}
                    <span className="font-semibold cursor-pointer" onClick={() => toggleSort(key)}>
                      {label} {sortColumn === key && renderSortIcon(key)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>

            {/* Aktive Filter-Zeile */}
            <tr className="bg-gray-700 text-white border-t border-gray-600">
              {columns.map(({ key }) => (
                <th key={key} className="px-4 py-3 border-b text-left">
                  {filters[key] && filters[key].length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {filters[key].map((filter: { operator: string; value: any }, index: number) => (
                        <div key={`${key}-${filter.value}-${index}`} className="bg-gray-800 text-white px-2 py-1 rounded flex items-center">
                          <span className="text-sm italic">
                            {filter.operator} <b>"{filter.value}"</b>
                          </span>
                          <button className="text-red-500 ml-2" onClick={() => removeFilter(key, index)}>
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-gray-900 text-white">
            {filteredData.length > 0 ? (
              filteredData.slice(0, itemsPerPage).map((item, index) => (
                <tr key={index} className="border border-gray-700 hover:bg-gray-800 transition">
                  {/* Status mit Icon */}
                  <td className="px-4 py-2 text-center border border-gray-700">
                    <div className="relative group">
                      {item.status === "done" ? "✔️" :
                        item.status === "failed" ? "❌" :
                          item.status === "installing" ? "🔄" : item.status}
                    </div>
                  </td>

                  {/* Type mit Icon */}
                  <td className="px-4 py-2 text-center border border-gray-700">
                    <div className="relative group">
                      {item.type === "lxc" ? "📦" :
                        item.type === "vm" ? "🖥️" : item.type}
                    </div>
                  </td>

                  {/* Dynamische Spaltenbreiten */}
                  <td className="px-4 py-3 border border-gray-700 max-w-[18%] truncate">{item.nsapp}</td>
                  <td className="px-4 py-3 border border-gray-700 max-w-[14%] truncate">{item.os_type}</td>

                  {/* Kleinere Spalten für HDD, Cores, RAM */}
                  <td className="px-4 py-3 border border-gray-700 text-center w-[6%]">{item.disk_size}</td>
                  <td className="px-4 py-3 border border-gray-700 text-center w-[6%]">{item.core_count}</td>
                  <td className="px-4 py-3 border border-gray-700 text-center w-[6%]">{item.ram_size}</td>

                  {/* Weitere Spalten mit Overflow-Fix */}
                  <td className="px-4 py-3 border border-gray-700 max-w-[12%] truncate">{item.method}</td>
                  <td className="px-4 py-3 border border-gray-700 max-w-[10%] truncate">{item.pve_version}</td>

                  {/* Fehler mit Tooltip & Icon */}
                  <td className="px-4 py-3 border border-gray-700 text-center relative">
                    {item.error && item.error !== "none" ? (
                      <button onClick={(e) => handleShowError(e, item.error)} className="text-yellow-500 hover:text-yellow-300">
                        <AlertCircle size={20} />
                      </button>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  {/* Created At mit Formatierung */}
                  <td className="px-4 py-3 border border-gray-700 whitespace-nowrap">{formatDate(item.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-3 text-center text-gray-500 border border-gray-700">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Fehler-Popup jetzt direkt neben dem Icon */}
      {errorPopup.open && (
        <div
          className="absolute bg-gray-900 text-white p-4 rounded shadow-lg z-50"
          style={{ top: errorPopup.y, left: errorPopup.x + 30 }} // Popup erscheint direkt rechts vom Icon
        >
          <p className="text-sm">{errorPopup.message}</p>
          <button
            onClick={handleCloseError}
            className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      )}

      {/* Load More Button */}
      {itemsPerPage < totalItems && (
        <div className="text-center mt-4">
          <button onClick={handleLoadMore} className="px-4 py-2 bg-blue-500 text-white rounded">
            Load more...
          </button>
        </div>
      )}
    </div>
  );
}

export default DataFetcher;