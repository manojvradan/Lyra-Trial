// src/pages/base/[baseId].tsx
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { EditableHeader } from "~/components/EditableHeader";
import { EditableCell } from "~/components/EditableCell";
import type { IconType } from 'react-icons';
import { useEffect } from "react";

// --- React Icons ---
import {
  FiBox, FiChevronDown, FiClock, FiPlus, FiGrid, FiSearch, FiSettings,
  FiFilter, FiEyeOff, FiArrowDown, FiShare2, FiMoreHorizontal,
  FiFileText, FiUser, FiCircle, FiPaperclip, FiHash, FiList,
  FiTrash2
} from "react-icons/fi";

// --- A map to easily retrieve icon components by name ---
const iconMap: { [key: string]: IconType } = {
  TEXT: FiFileText,
  NUMBER: FiHash,
  USER: FiUser,
  STATUS: FiCircle,
  ATTACHMENT: FiPaperclip,
};


// --- Main Page Component ---
export default function BasePage() {
  const router = useRouter();
  const { baseId } = router.query;
  const utils = api.useUtils();
  const { data: sessionData } = useSession();
  const isRouterReady = router.isReady;

    // --- DATA FETCHING ---
  // Step 1: Fetch the base to get its details and list of tables
  const { 
    data: base, 
    isLoading: isLoadingBase, 
    isError: isBaseError} = api.base.getById.useQuery(
    { id: baseId as string },
    { enabled: isRouterReady && !!baseId }
  );

    // For simplicity, we'll work with the *first* table of the base
  const tableId = base?.tables?.[0]?.id;

   // Step 2: Fetch the full data for that table
  const { data: tableData, 
    isLoading: isLoadingTable,
    isError: isTableError 
  } = api.table.getById.useQuery(
    { id: tableId as string },
    { enabled: !!tableId }
  );

// --- MUTATIONS ---
  const createTable = api.table.create.useMutation({
    onSuccess: () => {
      // After creating the table, refetch the base data.
      // This will update `tableId` and trigger the table data fetch.
      void utils.base.getById.invalidate({ id: baseId as string });
    },
    onError: (err) => {
      console.error("Failed to create table", err);
      // You could add user-facing error handling here
    },
  });

  const updateColumnName = api.table.updateColumnName.useMutation({
    onSuccess: () => utils.table.getById.invalidate({ id: tableId }),
  });

  const updateCell = api.table.updateCell.useMutation({
    // We can do optimistic updates here later for a faster feel
    onSuccess: () => utils.table.getById.invalidate({ id: tableId }),
  });
  
  const addColumn = api.table.addColumn.useMutation({
    onSuccess: () => utils.table.getById.invalidate({ id: tableId }),
  });
  
  const addRow = api.table.addRow.useMutation({
    onSuccess: () => utils.table.getById.invalidate({ id: tableId }),
  });

  const deleteColumn = api.table.deleteColumn.useMutation({
    onSuccess: () => utils.table.getById.invalidate({ id: tableId }),
  });

  const deleteRow = api.table.deleteRow.useMutation({
    onSuccess: () => utils.table.getById.invalidate({ id: tableId }),
  });

  useEffect(() => {
    // Trigger this effect only when the base has loaded, there's no tableId,
    // and we aren't already trying to create a table.
    if (base && !tableId && !createTable.isPending) {
      createTable.mutate({
        baseId: base.id,
        name: "Table 1", // Give a default name
      });
    }
  }, [base, tableId, createTable]);

  const handleAddColumn = () => {
    const name = prompt("Enter new column name:", "New Column");
    if (name && tableId) {
        addColumn.mutate({ tableId, name });
    }
  }

  const handleAddRow = () => {
    if (tableId) {
        addRow.mutate({ tableId });
    }
  }

  // 1. Handle initial loading state
  if (!isRouterReady || isLoadingBase) {
    return <div className="flex h-screen items-center justify-center">Loading Base...</div>;
  }
  
  // 2. Handle base not found or error
  if (isBaseError || !base) {
    return <div className="flex h-screen items-center justify-center">Error: Base could not be found.</div>;
  }

  // 3. Handle case where base exists but has no tables
  if (!tableId) {
    return <div className="flex h-screen items-center justify-center">This base has no tables. Please create one.</div>;
  }

  // 4. Handle table loading state (now that we know we have a tableId)
  if (isLoadingTable) {
    return <div className="flex h-screen items-center justify-center">Loading Table...</div>;
  }

  // 5. Handle table not found or error
  if (isTableError || !tableData) {
    return <div className="flex h-screen items-center justify-center">Error: Table could not be found.</div>;
  }

  return (
    <>
      <Head>
        <title>{base.name} - Airtable Clone</title>
      </Head>
      <div className="flex h-screen flex-col font-sans text-sm text-gray-800">
        {/* --- Top Header --- */}
        <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <FiBox className="h-6 w-6 text-gray-600" />
            <h1 className="text-lg font-semibold">{base.name}</h1>
            <FiChevronDown className="h-4 w-4 text-gray-500" />
            <FiClock className="ml-2 h-5 w-5 text-gray-400" />
          </div>
          <nav className="flex items-center gap-2">
             {["Data", "Automations", "Interfaces", "Forms"].map((item, i) => (
                <button key={item} className={`rounded px-3 py-1 font-medium ${ i === 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {item}
                </button>
             ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
              Trial: 14 days left
            </button>
            <button className="rounded border border-gray-300 bg-white px-3 py-1.5 font-medium">
              Launch
            </button>
            <button className="rounded bg-blue-600 px-4 py-1.5 font-medium text-white">
              Share
            </button>
            {sessionData?.user && (
                 <Image
                    src={sessionData.user.image ?? ''}
                    alt="User"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
            )}
          </div>
        </header>

        {/* --- Table Toolbar --- */}
        <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-3">
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-200">
                    <span className="font-medium">Table 1</span>
                    <FiChevronDown />
                </button>
                <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-200">
                    <FiPlus />
                    Add or import
                </button>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
                <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-200">
                    <FiEyeOff size={16}/> Hide fields
                </button>
                <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-200">
                    <FiFilter size={16}/> Filter
                </button>
                {/* ... Add other buttons like Group, Sort, Color ... */}
                 <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-200">
                    <FiArrowDown size={16}/> Sort
                </button>
                 <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-200">
                    <FiShare2 size={16}/> Share and sync
                </button>
                <FiSearch size={16}/>
                <FiMoreHorizontal size={16} />
            </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* --- Views Sidebar --- */}
          <aside className="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50">
            <div className="flex flex-1 flex-col p-2">
                <div className="flex items-center justify-between">
                    <button className="flex items-center gap-1 rounded p-1 font-semibold hover:bg-gray-200">
                        <FiGrid />
                        Grid view
                        <FiChevronDown size={14}/>
                    </button>
                    <FiList className="text-gray-500"/>
                </div>
                <div className="mt-2 space-y-1">
                    <button className="w-full text-left rounded p-1 text-gray-600 hover:bg-gray-200">Create new...</button>
                    <div className="relative">
                        <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Find a view" className="w-full rounded border-gray-300 bg-transparent py-1 pl-8 pr-2"/>
                    </div>
                    <button className="w-full text-left rounded bg-blue-100 p-1 font-medium text-blue-700">
                        Grid view
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 p-2 text-gray-600">
                <button className="flex items-center gap-1 rounded p-1 hover:bg-gray-200"><FiPlus /> Add...</button>
                <span>3 records</span>
            </div>
          </aside>
          
          {/* --- Main Table Area --- */}
          <main className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-gray-50 shadow-sm">
                <tr>
                  <th className="w-12 border-b border-r p-2 font-normal"></th>
                  {/* --- Column Headers --- */}
                  {tableData.columns.map((column) => {
                    const Icon = iconMap[column.type] ?? FiFileText;
                    return (
                      <th key={column.id} className="group relative min-w-[200px] border-b border-r p-2 font-medium">
                        <EditableHeader
                          initialValue={column.name}
                          onSave={(newName) => updateColumnName.mutate({ columnId: column.id, name: newName })}
                          Icon={Icon}
                        />
                        {/* --- ADD COLUMN DELETE BUTTON --- */}
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the "${column.name}" column?`)) {
                              deleteColumn.mutate({ columnId: column.id });
                            }
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 opacity-0 transition hover:bg-gray-200 hover:text-gray-700 group-hover:opacity-100"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </th>
                    );
                  })}
                  {/* Add Column Button */}
                  <th className="w-12 border-b p-2 font-normal">
                     <button onClick={handleAddColumn} className="rounded p-1.5 hover:bg-gray-200"><FiPlus/></button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* --- Table Rows --- */}
                {tableData.rows.map((row, index) => (
                    <tr key={row.id} className="group hover:bg-gray-50">
                      {/* --- ADD ROW DELETE BUTTON --- */}
                      <td className="relative border-b border-r text-center text-gray-500">
                        <span className="group-hover:opacity-0">{index + 1}</span>
                        <button
                          onClick={() => deleteRow.mutate({ rowId: row.id })}
                          className="absolute inset-0 m-auto flex h-full w-full items-center justify-center text-gray-400 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                      {tableData.columns.map((column) => {
                          const cell = row.cells.find(c => c.columnId === column.id);
                          return (
                            <td key={column.id} className="border-b border-r p-0">
                                <EditableCell
                                    initialValue={cell?.value ?? ''}
                                    onSave={(newValue) => updateCell.mutate({
                                        rowId: row.id,
                                        columnId: column.id,
                                        value: newValue,
                                    })}
                                />
                            </td>
                          )
                      })}
                      <td className="border-b"></td>
                    </tr>
                ))}
                {/* Add Row Button */}
                 <tr className="h-8">
                      <td className="border-r text-center">
                        <button onClick={handleAddRow} className="rounded p-1 text-gray-500 hover:bg-gray-200"><FiPlus/></button>
                        </td>
                      <td colSpan={tableData.columns.length + 1}></td>
                 </tr>
              </tbody>
            </table>
          </main>
        </div>
      </div>
    </>
  );
}