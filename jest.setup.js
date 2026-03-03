// Mock DataTable globally
global.DataTable = {
  feature: {
    register: jest.fn(),
  },
  util: {
    escapeHtml: jest.fn((str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }),
    escapeRegex: jest.fn((str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')),
  },
};


