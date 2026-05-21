'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, Search, UserPlus, Trophy, Check, X,
  UserCheck, Flame, Award, RefreshCw
} from 'lucide-react';

export default function SocialHub() {
  const { token, user: me, refreshUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Add friend state
  const [searchUsername, setSearchUsername] = useState('');
  const [addMessage, setAddMessage] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authentication gate redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch all social data
  const fetchSocialData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      
      // Fetch Leaderboard
      const leadRes = await fetch('/api/friends/leaderboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLeaderboard(leadData);
      }

      // Fetch Friends List
      const friendsRes = await fetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(friendsData);
      }

      // Fetch Pending Requests
      const reqsRes = await fetch('/api/friends/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (reqsRes.ok) {
        const reqsData = await reqsRes.json();
        setReceivedRequests(reqsData.received || []);
        setSentRequests(reqsData.sent || []);
      }
    } catch (err) {
      console.error('Error loading social elements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSocialData();
    }
  }, [token]);

  // Handle Add Friend Submission
  const handleAddFriend = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddMessage('');
    
    if (!searchUsername.trim()) {
      setAddError('Enter a valid username.');
      return;
    }

    if (searchUsername.trim().toLowerCase() === me?.username?.toLowerCase()) {
      setAddError('You cannot friend yourself.');
      return;
    }

    setAdding(true);

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friend_username: searchUsername })
      });

      const data = await response.json();

      if (response.status === 201) {
        setAddMessage(data.message || `Friend request sent to ${searchUsername}!`);
        setSearchUsername('');
        fetchSocialData(); // Refresh sent requests list
      } else {
        setAddError(data.message || 'Could not find that user in the galaxy.');
      }
    } catch (err) {
      setAddError('Server response disrupted. Try again later.');
    } finally {
      setAdding(false);
    }
  };

  // Accept/Decline Friend Requests
  const handleRequestResponse = async (friendId, action) => {
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friend_id: friendId, action }) // 'accept' or 'decline'
      });

      if (response.ok) {
        fetchSocialData(); // Refresh friends list & pending requests
        refreshUser(); // Awarded social butterfly badge if first friend accepted!
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || (!isAuthenticated && !token)) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div className="animate-spin-slow" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255, 255, 255, 0.1)', 
          borderTopColor: 'var(--glow-cyan)', 
          borderRadius: '50%',
          marginBottom: '16px'
        }} />
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          Aligning constellations...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '6px' }}>Social Hub</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Compare your aura XP with friends and unite your streaks.
          </p>
        </div>
        <button 
          onClick={fetchSocialData} 
          className="glowing-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          <RefreshCw size={16} />
          <span>Refresh Hub</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="tabs-container" style={{ marginBottom: '28px', maxWidth: '500px' }}>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({receivedRequests.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <div className="animate-spin-slow" style={{ 
            width: '35px', 
            height: '35px', 
            border: '3px solid rgba(255, 255, 255, 0.1)', 
            borderTopColor: 'var(--glow-cyan)',
            borderRadius: '50%',
            display: 'inline-block',
            marginBottom: '12px'
          }} />
          <p>Gathering galactic connections...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: WEEKLY LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Trophy size={24} color="var(--glow-gold)" />
                <h3 style={{ fontSize: '1.35rem' }}>Weekly XP Leaderboard</h3>
              </div>

              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  Leaderboard is silent. Add friends to start competing!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {leaderboard.map((player) => {
                    const isMe = player.id === me?.id;
                    const isFirst = player.rank === 1;
                    const isSecond = player.rank === 2;
                    const isThird = player.rank === 3;
                    
                    return (
                      <div 
                        key={player.id}
                        className={`glass-panel ${isFirst ? 'glow-joy' : isMe ? 'glow-peace' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 24px',
                          borderRadius: '16px',
                          background: isMe 
                            ? 'rgba(0, 255, 102, 0.05)' 
                            : isFirst 
                              ? 'rgba(255, 170, 0, 0.06)' 
                              : 'rgba(255, 255, 255, 0.02)',
                          border: isMe 
                            ? '1px solid rgba(0, 255, 102, 0.2)' 
                            : isFirst 
                              ? '1px solid rgba(255, 170, 0, 0.3)' 
                              : '1px solid var(--space-border)',
                          transform: isFirst ? 'scale(1.01)' : 'none',
                          transition: 'all 0.25s'
                        }}
                      >
                        {/* Player name & rank */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {/* Rank Icon or number */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isFirst 
                              ? 'rgba(255,170,0,0.15)' 
                              : isSecond 
                                ? 'rgba(255,255,255,0.1)' 
                                : isThird 
                                  ? 'rgba(138,43,226,0.15)' 
                                  : 'rgba(0,0,0,0.2)',
                            color: isFirst 
                              ? 'var(--glow-gold)' 
                              : isSecond 
                                ? '#fff' 
                                : isThird 
                                  ? 'var(--glow-purple)' 
                                  : 'var(--text-secondary)',
                            fontWeight: 700
                          }}>
                            {isFirst ? <Award size={20} /> : player.rank}
                          </div>
                          
                          <div>
                            <span style={{ 
                              fontSize: '1.05rem', 
                              fontWeight: isMe ? 700 : 500, 
                              color: isMe ? 'var(--glow-green)' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              {player.username}
                              {isMe && <span style={{ fontSize: '0.75rem', background: 'rgba(0, 255, 102, 0.1)', padding: '2px 8px', borderRadius: '10px', color: 'var(--glow-green)' }}>You</span>}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Level {player.level} Celestial
                            </span>
                          </div>
                        </div>

                        {/* Player XP & Streak */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          {/* Streak */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--glow-gold)' }}>
                            <Flame size={16} fill="var(--glow-gold)" />
                            <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                              {player.current_streak}d
                            </span>
                          </div>

                          {/* XP */}
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>
                              {player.xp}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>XP</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE FRIENDS LIST */}
          {activeTab === 'friends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Add Friend Panel */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <UserPlus size={18} color="var(--glow-cyan)" />
                  Invite Friend to Quest
                </h3>
                
                <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="celestial-input"
                      style={{ paddingLeft: '48px' }}
                      placeholder="Search friend's username..."
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      disabled={adding}
                    />
                  </div>
                  <button type="submit" className="glowing-btn" disabled={adding} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{adding ? 'Summoning...' : 'Send Invite'}</span>
                  </button>
                </form>

                {addMessage && <p style={{ color: 'var(--glow-green)', fontSize: '0.85rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} />{addMessage}</p>}
                {addError && <p style={{ color: 'var(--glow-pink)', fontSize: '0.85rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><X size={14} />{addError}</p>}
              </div>

              {/* Friends List Grid */}
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Users size={20} color="var(--glow-purple)" />
                  <h3 style={{ fontSize: '1.25rem' }}>Your Friends List ({friends.length})</h3>
                </div>

                {friends.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    <Users size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                    <p>No friends are currently on your path.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {friends.map((friend) => (
                      <div key={friend.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--space-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#fff'
                          }}>
                            {friend.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>{friend.username}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Level {friend.level} Journaler</span>
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          background: 'rgba(0,0,0,0.15)',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          fontSize: '0.85rem'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--glow-gold)' }}>
                            <Flame size={14} fill="var(--glow-gold)" />
                            <strong>{friend.current_streak} days</strong>
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            <strong>{friend.xp}</strong> XP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PENDING REQUESTS */}
          {activeTab === 'requests' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Incoming Requests */}
              <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <UserCheck size={18} color="var(--glow-green)" />
                  Received Invites ({receivedRequests.length})
                </h3>

                {receivedRequests.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No incoming invites.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {receivedRequests.map((req) => (
                      <div 
                        key={req.request_id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--space-border)',
                          padding: '12px 16px',
                          borderRadius: '12px'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', display: 'block' }}>{req.username}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Level {req.level} • {req.xp} XP</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleRequestResponse(req.user_id, 'accept')}
                            style={{
                              background: 'rgba(0, 255, 102, 0.1)',
                              border: '1px solid rgba(0, 255, 102, 0.25)',
                              color: 'var(--glow-green)',
                              padding: '6px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleRequestResponse(req.user_id, 'decline')}
                            style={{
                              background: 'rgba(255, 0, 127, 0.1)',
                              border: '1px solid rgba(255, 0, 127, 0.25)',
                              color: 'var(--glow-pink)',
                              padding: '6px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <UserPlus size={18} color="var(--glow-cyan)" />
                  Sent Outbox ({sentRequests.length})
                </h3>

                {sentRequests.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending outgoing invites.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sentRequests.map((req) => (
                      <div 
                        key={req.request_id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(0, 0, 0, 0.15)',
                          border: '1px solid var(--space-border)',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{req.username}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Level {req.level} Celestial</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--glow-cyan)', background: 'rgba(0, 255, 255, 0.08)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
