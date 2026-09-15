// Shim for google.script.run to use fetch() instead
// This allows the existing login.html code to work without modification

const API_BASE = window.location.origin;

// Create a mock google.script.run object
window.google = window.google || {};
window.google.script = window.google.script || {};

// Handler functions
class ScriptRunHandler {
    constructor() {
        this.successHandler = null;
        this.failureHandler = null;
        this.functionName = null;
        this.args = [];
    }

    withSuccessHandler(fn) {
        this.successHandler = fn;
        return this;
    }

    withFailureHandler(fn) {
        this.failureHandler = fn;
        return this;
    }

    async executeFunction() {
        try {
            let response;

            switch (this.functionName) {
                case 'authenticateUser':
                    response = await fetch(`${API_BASE}/api/auth`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: this.args[0],
                            password: this.args[1]
                        })
                    });
                    break;

                case 'getOrdersData':
                    response = await fetch(
                        `${API_BASE}/api/orders?identifier=${encodeURIComponent(this.args[0])}&role=${encodeURIComponent(this.args[1])}`
                    );
                    break;

                case 'updateOrderData':
                case 'updateArchivedOrderData':
                    response = await fetch(`${API_BASE}/api/order-update`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: this.args[0].id,
                            order_code: this.args[0].order_code,
                            archived: this.functionName === 'updateArchivedOrderData',
                            ...this.args[0]
                        })
                    });
                    break;

                case 'getAdminDashboardData':
                    response = await fetch(`${API_BASE}/api/admin-stats`);
                    break;

                case 'employeeSearchOrders':
                case 'adminSearchOrders':
                    const isEmployee = this.functionName === 'employeeSearchOrders';
                    response = await fetch(
                        `${API_BASE}/api/search?query=${encodeURIComponent(this.args[1])}&type=${isEmployee ? 'employee' : 'admin'}&identifier=${encodeURIComponent(this.args[0])}`
                    );
                    break;

                case 'getEmployeeStatistics':
                    response = await fetch(
                        `${API_BASE}/api/orders?identifier=${encodeURIComponent(this.args[0])}&role=employee`
                    );
                    break;

                case 'getDistributionOrders':
                    response = await fetch(`${API_BASE}/api/distribution`);
                    break;

                case 'deleteOrderFromDraft':
                    response = await fetch(`${API_BASE}/api/distribution`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: this.args[0] })
                    });
                    break;

                case 'updateDistributionStatus':
                    response = await fetch(`${API_BASE}/api/distribution`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: this.args[0],
                            admin_update: this.args[1]
                        })
                    });
                    break;

                default:
                    throw new Error(`Unknown function: ${this.functionName}`);
            }

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Handle special cases
            if (this.functionName === 'getEmployeeStatistics') {
                // Convert orders list to employee statistics format
                if (data.orders && Array.isArray(data.orders)) {
                    const stats = {
                        error: null,
                        overallRate: 0,
                        currentMonthRate: 0,
                        orders: data.orders
                    };
                    if (this.successHandler) this.successHandler(stats);
                } else {
                    if (this.successHandler) this.successHandler(data);
                }
            } else if (this.functionName === 'adminSearchOrders' || this.functionName === 'employeeSearchOrders') {
                // Convert results array to expected format
                if (this.successHandler) this.successHandler({
                    success: true,
                    results: data.results || data
                });
            } else if (this.functionName === 'getAdminDashboardData') {
                if (this.successHandler) this.successHandler(data);
            } else if (this.functionName === 'getOrdersData') {
                // Return just the orders array
                if (this.successHandler) this.successHandler(data.orders || []);
            } else if (this.functionName === 'getDistributionOrders') {
                // Return orders array
                if (this.successHandler) this.successHandler(data.orders || []);
            } else {
                // Generic response
                if (data.success !== undefined) {
                    if (this.successHandler) this.successHandler(data.success);
                } else if (data.order) {
                    if (this.successHandler) this.successHandler(data.order);
                } else {
                    if (this.successHandler) this.successHandler(data);
                }
            }

        } catch (error) {
            console.error('Script error:', error);
            if (this.failureHandler) {
                this.failureHandler({
                    message: error.message,
                    name: 'ClientException'
                });
            } else {
                console.error('Unhandled error:', error);
            }
        }
    }
}

// Create proxy for google.script.run
window.google.script.run = new Proxy({}, {
    get: function(target, prop) {
        if (prop === 'withSuccessHandler' || prop === 'withFailureHandler') {
            // These should not be accessed directly
            return null;
        }

        // Return a function that creates a new handler
        return function(...args) {
            const handler = new ScriptRunHandler();
            handler.functionName = prop;
            handler.args = args;
            
            // Execute after a microtask to allow for handler setup
            Promise.resolve().then(() => {
                handler.executeFunction();
            });

            // Return object for chaining
            return {
                withSuccessHandler(fn) {
                    handler.successHandler = fn;
                    return this;
                },
                withFailureHandler(fn) {
                    handler.failureHandler = fn;
                    return {
                        [handler.functionName]: (...newArgs) => {
                            handler.args = newArgs;
                            handler.executeFunction();
                        }
                    };
                }
            };
        };
    }
});

console.log('✅ Google Script Shim loaded - using Vercel API backend');
