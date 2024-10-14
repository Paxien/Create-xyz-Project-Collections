"use client";
import React from "react";



const databases = [
  "/api/db/datab",
  "/api/db/db12",
  "/api/db/scrapped_data",
  "/api/db/ddb",
  "/api/db/datab",
  "/api/db/new_db1",
  "/api/db/scraped-project-display-app-users",
  "/api/db/db10",
  "/api/db/community-hub-page-users",
  "/api/db/unified-marketplace-platform-users",
  "/api/db/data3",
  "/api/db/scrape_3",
  "/api/db/scrape_4",
  "/api/db/na1-home-page-users",
  "/api/db/data2",
  "/api/db/db123",
  "/api/db/homepage-navigator-users",
  "/api/db/email_data",
];

function MainComponent() {
  const [selectedDatabase, setSelectedDatabase] = useState(databases[0]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [history, setHistory] = useState([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const historyRef = useRef(null);
  const [favorites, setFavorites] = useState({
    databases: [],
    tables: [],
  });

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(selectedDatabase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SHOW TABLES" }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, body: ${text}`);
      }
      const data = await res.json();
      setTables(data);
    } catch (err) {
      setError(`Failed to fetch tables: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedDatabase]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace") handleReturnToTables();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const handleDatabaseChange = (e) => {
    setSelectedDatabase(e.target.value);
    setSelectedTable(null);
    addToHistory({ type: "database", name: e.target.value });
  };

  const handleTableClick = async (tableName) => {
    setSelectedTable(tableName);
    addToHistory({
      type: "table",
      name: tableName,
      database: selectedDatabase,
    });
    try {
      const res = await fetch(selectedDatabase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `SELECT * FROM ${tableName}` }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, body: ${text}`);
      }
      const data = await res.json();
      setTableData(data);
    } catch (err) {
      setError(`Failed to fetch table data: ${err.message}`);
    }
  };

  const getTableName = (table) => table?.table_name || Object.values(table)[0];

  const handleReturnToTables = () => {
    setSelectedTable(null);
    setTableData([]);
    addToHistory({ type: "database", name: selectedDatabase });
  };

  const addToHistory = (item) => {
    setHistory((prevHistory) => [
      ...prevHistory,
      { ...item, timestamp: new Date().toISOString() },
    ]);
  };

  const handleHistoryItemClick = (item) => {
    if (item.type === "database") {
      setSelectedDatabase(item.name);
      fetchTables();
    } else if (item.type === "table") {
      setSelectedDatabase(item.database);
      handleTableClick(item.name);
    }
  };

  const exportData = () => {
    const data = {
      history: history,
      favorites: favorites,
    };
    const dataString = JSON.stringify(data);
    const blob = new Blob([dataString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "database-viewer-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setHistory(data.history || []);
          setFavorites(data.favorites || { databases: [], tables: [] });
        } catch (err) {
          setError("Failed to import data. Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleCloseContextMenu = () => setShowContextMenu(false);

  useEffect(() => {
    document.addEventListener("click", handleCloseContextMenu);
    return () => document.removeEventListener("click", handleCloseContextMenu);
  }, []);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const paginatedData = tableData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const toggleFavorite = (type, item) => {
    setFavorites((prevFavorites) => {
      const newFavorites = { ...prevFavorites };
      const index = newFavorites[type].findIndex(
        (fav) => fav.path === item.path
      );
      if (index === -1) {
        newFavorites[type].push(item);
      } else {
        newFavorites[type].splice(index, 1);
      }
      return newFavorites;
    });
  };

  const isFavorite = (type, path) => {
    return favorites[type].some((fav) => fav.path === path);
  };

  const handleColumnClick = (columnName) => {
    console.log(`Column clicked: ${columnName}`);
  };

  const handleRowClick = (rowData) => {
    console.log(`Row clicked:`, rowData);
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div
      className="bg-[#1e1e1e] text-white p-4 h-screen flex flex-col"
      onContextMenu={handleContextMenu}
    >
      <h1 className="text-xl font-semibold mb-4">Database Viewer</h1>
      <div className="mb-4 flex items-center">
        <select
          className="bg-[#2d2d2d] p-2 rounded flex-grow"
          value={selectedDatabase}
          onChange={handleDatabaseChange}
        >
          {databases.map((db) => (
            <option key={db} value={db}>
              {db}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            toggleFavorite("databases", {
              name: selectedDatabase,
              path: selectedDatabase,
            })
          }
          className="ml-2 px-2 py-1 bg-yellow-500 rounded"
        >
          {isFavorite("databases", selectedDatabase) ? "★" : "☆"}
        </button>
      </div>
      <div className="flex mb-4">
        <div className="w-1/4 pr-4">
          <h2 className="text-lg font-semibold mb-2">History</h2>
          <ul
            ref={historyRef}
            className="bg-[#2d2d2d] rounded p-2 max-h-40 overflow-y-auto mb-2"
          >
            {history.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer hover:bg-[#3d3d3d] p-1 rounded"
                onClick={() => handleHistoryItemClick(item)}
              >
                {item.type === "database" ? "📁 " : "📄 "}
                {item.name}
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mb-4">
            <button
              onClick={exportData}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
            >
              Export Data
            </button>
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm cursor-pointer">
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="text-lg font-semibold mb-2">Favorites</h2>
          <div className="bg-[#2d2d2d] rounded p-2">
            <h3 className="font-semibold">Databases</h3>
            <ul>
              {favorites.databases.map((db, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:bg-[#3d3d3d] p-1 rounded"
                  onClick={() => setSelectedDatabase(db.name)}
                >
                  {db.name}
                </li>
              ))}
            </ul>
            <h3 className="font-semibold mt-2">Tables</h3>
            <ul>
              {favorites.tables.map((table, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:bg-[#3d3d3d] p-1 rounded"
                  onClick={() => {
                    setSelectedDatabase(table.database);
                    handleTableClick(table.name);
                  }}
                >
                  {`${table.database} / ${table.name}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-3/4 overflow-auto flex-grow">
          {selectedTable ? (
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                {selectedTable}
                <button
                  onClick={() =>
                    toggleFavorite("tables", {
                      name: selectedTable,
                      database: selectedDatabase,
                      path: `${selectedDatabase}/${selectedTable}`,
                    })
                  }
                  className="ml-2 px-2 py-1 bg-yellow-500 rounded"
                >
                  {isFavorite("tables", `${selectedDatabase}/${selectedTable}`)
                    ? "★"
                    : "☆"}
                </button>
                <button
                  onClick={handleReturnToTables}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ml-4"
                >
                  Return to Tables
                </button>
              </h2>
              <table className="w-full border-collapse table-auto">
                <thead className="bg-[#2d2d2d] sticky top-0">
                  <tr>
                    {paginatedData.length > 0 &&
                      Object.keys(paginatedData[0]).map((col) => (
                        <th
                          key={col}
                          className="p-2 text-left whitespace-nowrap cursor-pointer"
                          onClick={() => handleColumnClick(col)}
                        >
                          <div className="flex items-center">{col}</div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#3d3d3d] hover:bg-[#2d2d2d] cursor-pointer"
                      onClick={() => handleRowClick(row)}
                    >
                      {Object.values(row).map((val, idx) => (
                        <td key={idx} className="p-2">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-l"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-r"
                  >
                    Next
                  </button>
                </div>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="bg-[#2d2d2d] text-white rounded p-2 ml-4"
                >
                  {[5, 10, 15, 20].map((num) => (
                    <option key={num} value={num}>
                      {num} Rows
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-2">Tables</h2>
              <ul className="bg-[#2d2d2d] rounded p-2">
                {tables.map((table, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:bg-[#3d3d3d] p-1 rounded flex items-center justify-between"
                  >
                    <span onClick={() => handleTableClick(getTableName(table))}>
                      {getTableName(table)}
                    </span>
                    <button
                      onClick={() =>
                        toggleFavorite("tables", {
                          name: getTableName(table),
                          database: selectedDatabase,
                          path: `${selectedDatabase}/${getTableName(table)}`,
                        })
                      }
                      className="px-2 py-1 bg-yellow-500 rounded"
                    >
                      {isFavorite(
                        "tables",
                        `${selectedDatabase}/${getTableName(table)}`
                      )
                        ? "★"
                        : "☆"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {showContextMenu && (
        <div
          className="absolute z-50 bg-[#2d2d2d] p-4 rounded"
          style={{
            top: `${contextMenuPosition.y}px`,
            left: `${contextMenuPosition.x}px`,
          }}
        >
          <button
            className="text-white"
            onClick={() => alert("Context menu item 1 clicked")}
          >
            Context Menu Item 1
          </button>
          <button
            className="text-white ml-2"
            onClick={() => alert("Context menu item 2 clicked")}
          >
            Context Menu Item 2
          </button>
        </div>
      )}
    </div>
  );
}

function StoryComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Viewer Story</h1>
      <MainComponent />
    </div>
  );
}

export default MainComponent;

