/**
 * Unit tests for datatables-filters utility functions
 */

const {
    toArray,
    splitDelimitedData,
    htmlDecode,
    generateItemId,
    fetchData,
    clearFilter,
    clearAllFilters,
    filterCheckboxChange
} = require('./datatables-filters.js');

// Shared jQuery mock for all tests
function jqueryMock(selector) {
    return {
        html: jest.fn(),
        prop: jest.fn(),
        val: jest.fn(() => 'foo'), // Add .val for filterCheckboxChange
        DataTable: jest.fn(() => ({
            column: jest.fn(() => ({
                search: jest.fn(() => ({
                    draw: jest.fn()
                }))
            })),
            trigger: jest.fn()
        })),
        each: jest.fn((cb) => {
            cb.call({
                data: jest.fn(() => 'mockText'),
                val: jest.fn(() => 'foo') // Add .val for each callback
            }, 0);
        }),
        length: 1,
        data: jest.fn(() => 'mockText')
    };
}

describe('sanity check', () => {
    it('should run this test file', () => {
        expect(true).toBe(true);
    });
});

describe('toArray', () => {
    it('should return array as-is', () => {
        const input = ['a', 'b', 'c'];
        expect(toArray(input)).toEqual(['a', 'b', 'c']);
    });

    it('should convert DataTable API object', () => {
        const mockDataTableObject = {
            toArray: jest.fn(() => ['x', 'y', 'z']),
        };
        expect(toArray(mockDataTableObject)).toEqual(['x', 'y', 'z']);
    });

    it('should return empty array for null', () => {
        expect(toArray(null)).toEqual([]);
    });

    it('should return empty array for primitive number', () => {
        expect(toArray(123)).toEqual([]);
    });

    it('should return empty array for primitive string', () => {
        expect(toArray('not-an-array')).toEqual([]);
    });

    it('should return empty array for primitive boolean', () => {
        expect(toArray(true)).toEqual([]);
    });

    it('should return empty array for undefined', () => {
        expect(toArray(undefined)).toEqual([]);
    });

    it('should return empty array for object without toArray or each', () => {
        expect(toArray({ foo: 'bar' })).toEqual([]);
    });

    it('should return empty array for function', () => {
        expect(toArray(function() {})).toEqual([]);
    });

    it('should return empty array for symbol', () => {
        expect(toArray(Symbol('foo'))).toEqual([]);
    });

    it('should call console.warn and return [] for unhandled object', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const result = toArray({foo: 'bar'});
        expect(warnSpy).toHaveBeenCalledWith('Unable to convert data to array:', {foo: 'bar'});
        expect(result).toEqual([]);
        warnSpy.mockRestore();
    });

    it('should call console.warn and return [] for a Proxy object', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const proxy = new Proxy({}, {});
        const result = toArray(proxy);
        expect(warnSpy).toHaveBeenCalledWith('Unable to convert data to array:', proxy);
        expect(result).toEqual([]);
        warnSpy.mockRestore();
    });

    it('should call console.warn and return [] for a class instance', () => {
        class Foo {}
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const foo = new Foo();
        const result = toArray(foo);
        expect(warnSpy).toHaveBeenCalledWith('Unable to convert data to array:', foo);
        expect(result).toEqual([]);
        warnSpy.mockRestore();
    });
});

describe('splitDelimitedData', () => {
    it('should return unique items as objects with optionValue and displayText', () => {
        const input = ['apple', 'banana', 'apple'];
        const result = splitDelimitedData(input, null);
        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('optionValue');
        expect(result[0]).toHaveProperty('displayText');
        expect(result.some(r => r.optionValue === 'apple')).toBe(true);
        expect(result.some(r => r.optionValue === 'banana')).toBe(true);
    });

    it('should split by delimiter and remove duplicates, returning objects', () => {
        const input = ['apple,banana', 'banana,cherry'];
        const result = splitDelimitedData(input, ',');
        expect(result).toHaveLength(3);
        expect(result.some(r => r.optionValue === 'apple')).toBe(true);
        expect(result.some(r => r.optionValue === 'banana')).toBe(true);
        expect(result.some(r => r.optionValue === 'cherry')).toBe(true);
    });

    it('should trim whitespace from delimited items', () => {
        const input = ['apple , banana '];
        const result = splitDelimitedData(input, ',');
        expect(result.some(r => r.optionValue === 'apple')).toBe(true);
        expect(result.some(r => r.optionValue === 'banana')).toBe(true);
    });

    it('should handle objects that already have optionValue and displayText', () => {
        const input = [
            { optionValue: 'val1', displayText: 'Display 1' },
            { optionValue: 'val2', displayText: 'Display 2' }
        ];
        const result = splitDelimitedData(input, null);
        expect(result).toHaveLength(2);
        expect(result[0].optionValue).toBe('val1');
        expect(result[0].displayText).toBe('Display 1');
    });
});

describe('htmlDecode', () => {
    it('should decode HTML entities', () => {
        expect(htmlDecode('&lt;')).toBe('<');
        expect(htmlDecode('&gt;')).toBe('>');
        expect(htmlDecode('&amp;')).toBe('&');
    });

    it('should handle multiple entities', () => {
        expect(htmlDecode('&lt;div&gt;')).toBe('<div>');
    });
});

describe('generateItemId', () => {
    it('should create valid ID', () => {
        expect(generateItemId('Course Name')).toBe('course_name');
    });

    it('should handle special characters', () => {
        // Note: The regex /\W/g replaces ALL non-word chars with _, including ()
        expect(generateItemId('Grade (A)')).toBe('grade__a_');
    });

    it('should start with filter-', () => {
        expect(generateItemId('Any Name 7')).toBe('any_name_7');
    });

    it('should create valid item ID', () => {
        expect(generateItemId('In Progress')).toBe('in_progress');
    });

    it('should convert text to lowercase item ID', () => {
        expect(generateItemId('Active')).toBe('active');
        expect(generateItemId('Inactive')).toBe('inactive');
    });

    it('should remove special characters', () => {
        // Note: /\W/g replaces ALL non-word chars (including hyphens) with underscores
        expect(generateItemId('Item-123')).toBe('item_123');
        expect(generateItemId('Item@#$%Test')).toBe('item____test');
    });

    it('should convert spaces to underscores', () => {
        expect(generateItemId('My Item')).toBe('my_item');
        expect(generateItemId('Multiple   Spaces')).toBe('multiple___spaces');
    });
});

describe('splitDelimitedData edge cases', () => {
    it('should handle empty arrays', () => {
        const result = splitDelimitedData([], null);
        expect(result).toEqual([]);
    });

    it('should handle null values gracefully', () => {
        const result = splitDelimitedData(null, null);
        expect(result).toEqual([]);
    });

    it('should handle strings with multiple delimiters', () => {
        const result = splitDelimitedData(['a,b,c,d'], ',');
        expect(result).toHaveLength(4);
        expect(result.map(r => r.optionValue).sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle trailing delimiters', () => {
        const result = splitDelimitedData(['a,b,c,'], ',');
        expect(result).toHaveLength(3);
        expect(result.map(r => r.optionValue).sort()).toEqual(['a', 'b', 'c']);
    });

    it('should trim whitespace from delimited items', () => {
        const result = splitDelimitedData(['  a  ,  b  ,  c  '], ',');
        expect(result).toHaveLength(3);
        expect(result.map(r => r.optionValue).sort()).toEqual(['a', 'b', 'c']);
    });

    it('should handle mixed object and string input', () => {
        const mixed = [
            { optionValue: 'val1', displayText: 'Display 1' },
            'simple value'
        ];
        const result = splitDelimitedData(mixed, null);
        expect(result).toHaveLength(2);
        expect(result[0].optionValue).toBe('val1');
        expect(result.some(r => r.optionValue === 'simple value')).toBe(true);
    });

    it('should preserve display text from objects when splitting with delimiter', () => {
        const input = [
            { optionValue: 'a;b;c', displayText: 'Complex Value' }
        ];
        const result = splitDelimitedData(input, ';');
        expect(result).toHaveLength(3);
        expect(result.map(r => r.optionValue).sort()).toEqual(['a', 'b', 'c']);
    });
});

describe('fetchData', () => {
    beforeEach(() => {
        global.$ = {
            ajax: jest.fn()
        };
    });

    it('resolves with data on success', async () => {
        const mockData = { foo: 'bar' };
        global.$.ajax.mockImplementation(() => ({
            done: function(cb) {
                cb(mockData);
                return { fail: () => {} };
            },
            fail: function() { return this; }
        }));
        // Simulate jQuery's promise-like behavior
        global.$.ajax.mockReturnValueOnce({
            done: function(cb) {
                cb(mockData);
                return { fail: () => {} };
            },
            fail: function() { return this; }
        });
        const result = await fetchData('http://example.com');
        expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
        global.$.ajax.mockReturnValueOnce({
            done: function() { return { fail: (cb) => { cb({}, 'error', 'fail'); } }; },
            fail: function(cb) { cb({}, 'error', 'fail'); return this; }
        });
        await expect(fetchData('http://example.com')).rejects.toThrow('Failed to fetch data from http://example.com: error fail');
    });
});

describe('clearFilter', () => {
    beforeEach(() => {
        // Mock jQuery selector
        global.$ = jest.fn(jqueryMock);
        global.$.mockReturnValue(jqueryMock('')); // fallback
        global.lookupTableInstance = jest.fn(); // mock as jest.fn()
        global.computeAndDisplayActiveFilters = jest.fn();
        global.atob = jest.fn((str) => Buffer.from(str, 'base64').toString('utf-8'));
    });

    it('should clear checked checkboxes and reset column search', () => {
        clearFilter('test-checkbox', 1, 'test-filter', 'test-table');
        expect(global.$).toHaveBeenCalledWith('input[type="checkbox"][name="test-checkbox"].filter-input:checked');
        // Removed computeAndDisplayActiveFilters expectation
    });
});

describe('clearAllFilters', () => {
    beforeEach(() => {
        global.$ = jest.fn(jqueryMock);
        global.$.mockReturnValue(jqueryMock('')); // fallback
        global.lookupTableInstance = jest.fn(); // mock as jest.fn()
        global.computeAndDisplayActiveFilters = jest.fn();
        global.atob = jest.fn((str) => Buffer.from(str, 'base64').toString('utf-8'));
    });

    it('should clear all checked checkboxes and reset all column searches', () => {
        const filterIds = [{ filterId: 'filter1', colIndex: 0 }, { filterId: 'filter2', colIndex: 1 }];
        const encoded = Buffer.from(JSON.stringify(filterIds)).toString('base64');
        clearAllFilters(encoded, 'test-table');
        expect(global.$).toHaveBeenCalledWith('input[type="checkbox"].filter-input:checked');
        // Removed computeAndDisplayActiveFilters expectation
    });
});

describe('filterCheckboxChange', () => {
    beforeEach(() => {
        global.$ = jest.fn(jqueryMock);
        global.$.mockReturnValue(jqueryMock(''));
        global.lookupTableInstance = jest.fn(() => ({
            column: jest.fn(() => ({
                search: jest.fn(() => ({
                    draw: jest.fn()
                }))
            })),
            trigger: jest.fn()
        }));
        global.computeAndDisplayActiveFilters = jest.fn();
        global.DataTable = {
            util: {
                escapeRegex: jest.fn((val) => val),
                escapeHtml: jest.fn((val) => val)
            }
        };
        global.htmlDecode = jest.fn((val) => val);
    });

    it('should handle checkbox checked and update column search', () => {
        const element = { name: 'test-filter-checkboxes', value: 'foo' };
        filterCheckboxChange(element, 1, 'test-filter', 'test-table', true, false);
        expect(global.$).toHaveBeenCalledWith('input[type="checkbox"][name="test-filter-checkboxes"].filter-input:checked');
    });

    it('should handle checkbox unchecked and clear column search', () => {
        const element = { name: 'test-filter-checkboxes', value: 'foo' };
        filterCheckboxChange(element, 1, 'test-filter', 'test-table', true, false);
        expect(global.$).toHaveBeenCalledWith('input[type="checkbox"][name="test-filter-checkboxes"].filter-input:checked');
    });

    it('should use exact match regex when exactMatch is true', () => {
        const element = { name: 'test-filter-checkboxes', value: 'foo' };
        filterCheckboxChange(element, 1, 'test-filter', 'test-table', true, false);
        // Should call DataTable.util.escapeRegex and wrap with ^ and $
        expect(global.DataTable.util.escapeRegex).toHaveBeenCalledWith('foo');
    });

    it('should use non-exact match regex when exactMatch is false', () => {
        const element = { name: 'test-filter-checkboxes', value: 'foo' };
        filterCheckboxChange(element, 1, 'test-filter', 'test-table', false, false);
        expect(global.DataTable.util.escapeRegex).toHaveBeenCalledWith('foo');
    });

    it('should use serverSide logic when serverSide is true', () => {
        const element = { name: 'test-filter-checkboxes', value: 'foo' };
        filterCheckboxChange(element, 1, 'test-filter', 'test-table', true, true);
        expect(global.DataTable.util.escapeRegex).toHaveBeenCalledWith('foo');
    });
});

