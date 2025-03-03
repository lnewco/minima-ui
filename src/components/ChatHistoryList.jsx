import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getCustomers } from '../services/api';

const ChatHistoryList = ({ onUserSelect, selectedUser }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const data = await getCustomers();
                setCustomers(data);
            } catch (err) {
                setError('Failed to load customers');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    if (loading) {
        return <div className="chat-history-loading">Loading...</div>;
    }

    if (error) {
        return <div className="chat-history-error">{error}</div>;
    }

    return (
        <div className="chat-history-list">
            {customers.length === 0 ? (
                <div className="chat-history-empty">No customers found</div>
            ) : (
                customers.map((customer) => (
                    <button
                        key={customer.id}
                        className={`chat-history-item ${selectedUser?.id === customer.id ? 'selected' : ''}`}
                        onClick={() => onUserSelect(customer)}
                    >
                        <div className="chat-history-item-avatar">
                            {customer.photo ? (
                                <img
                                    src={customer.photo}
                                    alt={`${customer.firstName} ${customer.lastName}`}
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {customer.firstName[0]}{customer.lastName[0]}
                                </div>
                            )}
                        </div>
                        <div className="chat-history-item-info">
                            <div className="chat-history-item-name">
                                {customer.firstName} {customer.lastName}
                            </div>
                        </div>
                    </button>
                ))
            )}
        </div>
    );
};

ChatHistoryList.propTypes = {
    onUserSelect: PropTypes.func.isRequired,
    selectedUser: PropTypes.shape({
        id: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
    }),
};

export default ChatHistoryList;