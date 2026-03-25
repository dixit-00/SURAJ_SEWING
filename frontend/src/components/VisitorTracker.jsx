import { useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';

const VisitorTracker = () => {
    const { dbUser } = useAuth();

    useEffect(() => {
        const trackVisitor = async () => {
            try {
                let visitorId = localStorage.getItem('visitorId');
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem('visitorId', visitorId);
                }

                const userAgent = navigator.userAgent;
                
                const trackingData = {
                    visitor_id: visitorId,
                    user_agent: userAgent,
                    last_active: new Date().toISOString()
                };

                // Link user ID if logged in
                if (dbUser && dbUser.id) {
                    trackingData.user_id = dbUser.id;
                }

                await supabase.from('visitors').upsert(trackingData, { onConflict: 'visitor_id' });
                
                // Also update cart_events for this visitor if they just logged in
                if (dbUser && dbUser.id) {
                    await supabase
                        .from('cart_events')
                        .update({ user_id: dbUser.id })
                        .eq('visitor_id', visitorId)
                        .is('user_id', null);
                }
            } catch (error) {
                console.error('Error tracking visitor:', error);
            }
        };

        trackVisitor();
        
        // Update activity every 3 minutes if the page stays open
        const interval = setInterval(trackVisitor, 3 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [dbUser]);

    return null;
};

export default VisitorTracker;
