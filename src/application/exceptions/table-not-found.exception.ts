class TableNotFoundException extends Error {
  constructor(message?: string) {
    super(message ?? 'Table not found.');
    this.name = 'TableNotFoundException';
  }
}

export default TableNotFoundException;