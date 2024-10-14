
This code is a React component for a **Database Viewer** application, where users can view tables from various databases, interact with table data, maintain a history of actions, and manage favorites.

How to use:
This was deisgned to allow create users to copy and paste code to be resued in ther eown projects.






Here's a breakdown of how the code works:

![xcc](https://github.com/user-attachments/assets/47bb1563-161c-449d-8d7e-839a20357713)

### 1. **Imports and State Setup**
   - The component starts by importing `React` and initializing several state variables using `useState` to track:
     - **selectedDatabase**: the currently selected database.
     - **tables**: the list of tables for the selected database.
     - **loading**: loading state to display a loading message while fetching data.
     - **error**: for error handling.
     - **selectedTable**: the table currently being viewed.
     - **tableData**: the data fetched from the selected table.
     - **history**: the history of database and table views.
     - **showContextMenu** and **contextMenuPosition**: for managing the context menu (right-click).
     - **currentPage** and **rowsPerPage**: for pagination of table data.
     - **favorites**: for storing user favorites (both databases and tables).

### 2. **Databases List**
   - The `databases` array contains a list of available databases to choose from. Users can select a database to view its tables.

### 3. **Fetching Tables**
   - The `fetchTables` function makes an asynchronous `POST` request to the selected database's API endpoint, using the SQL query `SHOW TABLES` to fetch a list of tables. It updates the `tables` state once the data is fetched.
   - This function is called inside a `useEffect` hook to fetch tables when the component is first rendered and whenever the `selectedDatabase` changes.

### 4. **Handling Table Selection**
   - When a user clicks on a table (`handleTableClick`), the app fetches and displays the table's data by sending a `SELECT * FROM {tableName}` request to the database. The result is stored in `tableData`.
   - The function also updates the `history` to log the action of viewing a table.

### 5. **Pagination**
   - The table data is paginated based on the current page and rows per page (`rowsPerPage`). The data is sliced according to these values, and pagination controls (Previous/Next) are displayed at the bottom of the table.
   - Pagination is managed by `handlePageChange` and `handleRowsPerPageChange`.

### 6. **History and Favorites**
   - **History**: This keeps track of all visited databases and tables. It is stored in an array and displayed as a clickable list. When a history item is clicked, it restores the state to show that database or table.
   - **Favorites**: Users can mark databases and tables as favorites, which are then shown in a separate "Favorites" section. The toggle function (`toggleFavorite`) adds or removes items from the favorites list. These are also displayed with stars (★ or ☆) to indicate whether the item is a favorite.

### 7. **Context Menu**
   - A right-click context menu (`handleContextMenu`) is implemented, which shows when the user right-clicks. The menu can be customized with various options.
   - It appears at the position of the right-click (`contextMenuPosition`).

### 8. **Data Import and Export**
   - **Export Data**: Allows the user to export the current history and favorites as a `.json` file.
   - **Import Data**: Lets the user upload a `.json` file to restore history and favorites.

### 9. **Rendering**
   - The component conditionally renders either the list of tables (if no table is selected) or the selected table's data.
   - **Error Handling**: If an error occurs while fetching data, it is shown to the user.
   - **Loading**: If data is being fetched, a loading message is shown.

### 10. **Subcomponents**
   - **StoryComponent**: A wrapper component that contains the `MainComponent`. It is used to provide a "story" or structure for viewing the Database Viewer.

### Code flow summary:
1. **Initialization**: State variables are initialized.
2. **Database Selection**: When a user selects a database, it triggers fetching the tables from that database.
3. **Table Selection**: Clicking a table fetches and displays the table's data.
4. **History Tracking**: Every action (database selection, table view) is logged into history.
5. **Favorites**: Users can mark databases and tables as favorites, with star icons.
6. **Context Menu**: Right-click triggers a context menu.
7. **Pagination**: Data is displayed with pagination controls.
8. **Import/Export**: Users can export/import their history and favorites.

This structure provides a highly interactive and customizable user experience for working with databases and tables.
