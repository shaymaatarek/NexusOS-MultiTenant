using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using nexusos_data.Data;
using nexusos_data.Repositories;
using System.Data;

namespace nexusos_data.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly NexusOSDbContext _context;
        private readonly Dictionary<string, object> _repositories;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(NexusOSDbContext context)
        {
            _context = context;
            _repositories = new Dictionary<string, object>();
        }
        public async Task<int> SaveChangesAsync()
        {
            try
            {
                int y = await _context.SaveChangesAsync();
                return y;
            }
            catch (Exception ex)
            {
                return -1;
                // Log the exception details here
                // For example: _logger.LogError(ex, "An error occurred while saving changes to the database.");
            }
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                await SaveChangesAsync();
                await _transaction?.CommitAsync()!;
            }
            catch
            {
                await RollbackTransactionAsync();
                throw;
            }
            finally
            {
                _transaction?.Dispose();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            try
            {
                await _transaction?.RollbackAsync()!;
            }
            finally
            {
                _transaction?.Dispose();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            if (_context != null)
            {
                if (_context.Database.GetDbConnection().State == ConnectionState.Connecting)
                {
                    // Optional: Log this as it usually indicates an un-awaited task
                }
                _context.Dispose();
            }
            GC.SuppressFinalize(this);
        }
    }
}