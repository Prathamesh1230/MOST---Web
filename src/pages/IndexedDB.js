// class IndexedDBService {
//   constructor() {
//     this.dbName = 'MOSTCalculatorDB';
//     this.version = 1;
//   }

//   initDB() {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, this.version);

//       request.onerror = () => reject(request.error);

//       request.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         if (!db.objectStoreNames.contains('calculations')) {
//           const store = db.createObjectStore('calculations', { keyPath: 'id', autoIncrement: true });
//           store.createIndex('userId', 'userId', { unique: false });
//           store.createIndex('date', 'date', { unique: false });
//         }
//       };

//       request.onsuccess = () => resolve(request.result);
//     });
//   }

//   saveCalculation(data) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const db = await this.initDB();
//         const transaction = db.transaction(['calculations'], 'readwrite');
//         const store = transaction.objectStore('calculations');
        
//         const request = store.add(data);
        
//         request.onsuccess = () => resolve(request.result);
//         request.onerror = () => reject(request.error);
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }

//   getCalculationsByUserId(userId) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const db = await this.initDB();
//         const transaction = db.transaction(['calculations'], 'readonly');
//         const store = transaction.objectStore('calculations');
//         const index = store.index('userId');
        
//         const request = index.getAll(userId);
        
//         request.onsuccess = () => resolve(request.result);
//         request.onerror = () => reject(request.error);
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }
//   // Add to IndexedDB.js
// async deleteCalculation(id) {
//   const db = await this.initDB();
//   const tx = db.transaction('calculations', 'readwrite');
//   const store = tx.objectStore('calculations');
//   await store.delete(id);
//   return tx.complete;
// }

//   getCalculationsByDate(userId, startDate, endDate) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const db = await this.initDB();
//         const transaction = db.transaction(['calculations'], 'readonly');
//         const store = transaction.objectStore('calculations');
//         const index = store.index('date');
        
//         const request = index.getAll(IDBKeyRange.bound(startDate, endDate));
        
//         request.onsuccess = () => {
//           const results = request.result.filter(calc => calc.userId === userId);
//           resolve(results);
//         };
//         request.onerror = () => reject(request.error);
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }
// }

// export default new IndexedDBService();


class IndexedDBService {
  constructor() {
    this.dbName = 'MOSTCalculatorDB';
    this.version = 2; // Updated version number
  }

  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Handle version 1 to 2 upgrade
        if (event.oldVersion < 1) {
          const store = db.createObjectStore('calculations', { keyPath: 'id', autoIncrement: true });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
        
        // Add any new version upgrades here
        if (event.oldVersion < 2) {
          const store = event.target.transaction.objectStore('calculations');
          // Add any new indexes or modify existing ones for version 2
          if (!store.indexNames.contains('title')) {
            store.createIndex('title', 'title', { unique: false });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveCalculation(data) {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calculations'], 'readwrite');
        const store = transaction.objectStore('calculations');
        
        // Add timestamp if not present
        const enhancedData = {
          ...data,
          timestamp: data.timestamp || new Date().toISOString()
        };
        
        const request = store.add(enhancedData);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw error;
    }
  }

  async getCalculationsByUserId(userId) {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calculations'], 'readonly');
        const store = transaction.objectStore('calculations');
        const index = store.index('userId');
        const request = index.getAll(userId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error fetching calculations:', error);
      throw error;
    }
  }

  async deleteCalculation(id) {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calculations'], 'readwrite');
        const store = transaction.objectStore('calculations');
        const request = store.delete(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error deleting calculation:', error);
      throw error;
    }
  }

  async getCalculationsByDate(userId, startDate, endDate) {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calculations'], 'readonly');
        const store = transaction.objectStore('calculations');
        const index = store.index('date');
        const range = IDBKeyRange.bound(startDate, endDate);
        const request = index.getAll(range);
        
        request.onsuccess = () => {
          const results = request.result.filter(calc => calc.userId === userId);
          resolve(results);
        };
        
        request.onerror = () => reject(request.error);
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error fetching calculations by date:', error);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calculations'], 'readwrite');
        const store = transaction.objectStore('calculations');
        const request = store.clear();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
}

export default new IndexedDBService();