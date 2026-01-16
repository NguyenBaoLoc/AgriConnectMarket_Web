import React, { useEffect, useState } from 'react';
import { Bell, Check, Mail, Eye, ExternalLink, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from './types';
import { getMyNotifications, updateNotificationStatus } from './api';
import { readAll } from '../../customer/NotificationPage/api';
import { useNotification } from '../../../components/NotificationContext';


export function NotificationPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const { setCount } = useNotification();

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return 'Today at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInDays === 1) {
            return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    // Toggle read status
    const toggleReadStatus = async (id: string) => {
        try {
            const response = await updateNotificationStatus(id);
            if (response) {
                const updated = notifications.map(notif =>
                    notif.id === id ? { ...notif, isRead: !notif.isRead } : notif
                );
                setNotifications(updated);
                setCount(updated.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Error updating notification status:', error);
        }
    };

    // Navigate to order page
    const goToOrder = (id: string, isRead: boolean, orderId: string) => {
        if (!isRead) {
            toggleReadStatus(id);
        }
        navigate(`/farmer/orders/${orderId}`);
    };

    const markAllAsRead = async () => {
        try {
            const response = await readAll();
            if (response) {
                const updated = notifications.map(notif => ({
                    ...notif,
                    isRead: true
                }));
                setNotifications(updated);
                setCount(0); // or updated.filter(n => !n.isRead).length
            }
        } catch (error) {
            console.error('Error updating notification status:', error);
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notif => {
        if (filterStatus === 'unread') return !notif.isRead;
        if (filterStatus === 'read') return notif.isRead;
        return true;
    });

    // Sort notifications
    const sortedNotifications = [...filteredNotifications].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getMyNotifications();
                setNotifications(response);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };
        fetchNotifications();
    }, []);
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="w-3/4 mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-gray-900">Notifications</h1>
                            <p className="text-gray-600">
                                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter and Sort Controls */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">Filter:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'all'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('unread')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'unread'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Unread
                                </button>
                                <button
                                    onClick={() => setFilterStatus('read')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'read'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Read
                                </button>
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2 ml-auto">
                            <ArrowUpDown className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">Sort:</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                onClick={() => markAllAsRead()}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors bg-green-600 text-white hover:bg-green-700}`}>
                                <Check className="w-4 h-4" />
                                Mark ALL as Read
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {sortedNotifications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-600">
                                {filterStatus === 'unread'
                                    ? "You don't have any unread notifications."
                                    : filterStatus === 'read'
                                        ? "You don't have any read notifications."
                                        : "You don't have any notifications yet."}
                            </p>
                        </div>
                    ) : (
                        sortedNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-lg shadow-sm p-6 transition-all ${notification.isRead ? 'opacity-50' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.isRead
                                            ? 'bg-gray-100'
                                            : 'bg-green-100'
                                            }`}
                                    >
                                        {notification.isRead ? (
                                            <Mail className={`w-5 h-5 ${notification.isRead ? 'text-gray-400' : 'text-green-600'}`} />
                                        ) : (
                                            <Bell className="w-5 h-5 text-green-600" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className={notification.isRead ? 'text-gray-500' : 'text-gray-900'}>
                                                {notification.title}
                                            </h3>
                                            <span className={`text-sm whitespace-nowrap ${notification.isRead ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                {formatDate(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className={`mb-4 ${notification.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {notification.message}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => toggleReadStatus(notification.id)}
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${notification.isRead
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                {notification.isRead ? (
                                                    <>
                                                        <Eye className="w-4 h-4" />
                                                        Mark as Unread
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Mark as Read
                                                    </>
                                                )}
                                            </button>

                                            {notification.order && (
                                                <button
                                                    onClick={() => goToOrder(notification.id, notification.isRead, notification.order?.id || '')}
                                                    className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    View Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Results count */}
                {sortedNotifications.length > 0 && (
                    <div className="mt-6 text-center text-gray-600">
                        Showing {sortedNotifications.length} of {notifications.length} notifications
                    </div>
                )}
            </div>
        </div>
    );
}
