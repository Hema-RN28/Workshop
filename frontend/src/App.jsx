import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "eventpulse_access_token";

const eventName = (event) => event.name || event.title || event.event_name || "Untitled event";
const eventDate = (event) => event.start_date || event.event_date || event.date || event.starts_at;
const eventLocation = (event) => event.location || event.venue || event.venue_name || "Location to be announced";
const eventDescription = (event) => event.description || event.summary || "Meet, learn, and connect with the people shaping what comes next.";
const eventCapacity = (event) => Number(event.capacity || event.total_capacity || event.max_attendees || 0);
const eventRegistered = (event) => Number(event.registered_count || event.attendee_count || event.registrations_count || 0);
const eventStatus = (event) => String(event.status || "OPEN").toUpperCase().replaceAll("_", " ");
const eventId = (event) => String(event.id ?? event.event_id ?? "");

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    throw new Error(`The API returned an empty or invalid JSON response (${response.status} ${response.statusText}).`);
  }
}

const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

function Icon({ name, size = 18 }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
    ticket: <><path d="M2 9a3 3 0 0 0 0 6v3h20v-3a3 3 0 0 1 0-6V6H2Z" /><path d="M13 6v2m0 4v2m0 4v2" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 17 6l3 6M4 12l3 6a7 7 0 0 0 11.5-3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    external: <><path d="M14 3h7v7M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.grid}</svg>;
}

function App() {
  const [page, setPage] = useState("explore");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [activeEvent, setActiveEvent] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All events");
  const [sortOrder, setSortOrder] = useState("Newest first");
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [manifestEventId, setManifestEventId] = useState("");
  const [manifestError, setManifestError] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const response = await fetch(`${API_URL}/api/events`);
      const payload = await readJson(response);
      if (!response.ok) throw new Error(payload.error || `Unable to load events (${response.status}).`);
      if (!Array.isArray(payload)) throw new Error("The events endpoint returned an unexpected response.");
      setEvents(payload);
    } catch (error) {
      setApiError(error.message || "Unable to connect to the events service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredEvents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = events.filter((event) => {
      const matchesQuery = !needle || [eventName(event), eventDescription(event), eventLocation(event), event.organizer_name]
        .some((value) => String(value || "").toLowerCase().includes(needle));
      const status = eventStatus(event);
      return matchesQuery && (statusFilter === "All events" || status.includes(statusFilter.toUpperCase()));
    });
    return filtered.sort((a, b) => {
      if (sortOrder === "Name A–Z") return eventName(a).localeCompare(eventName(b));
      const dateA = new Date(eventDate(a) || 0).getTime();
      const dateB = new Date(eventDate(b) || 0).getTime();
      return sortOrder === "Oldest first" ? dateA - dateB : dateB - dateA;
    });
  }, [events, query, sortOrder, statusFilter]);

  const openEvent = (event) => {
    setActiveEvent(event);
    setPage("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestToken = () => {
    setTokenDraft(token);
    setShowTokenDialog(true);
  };

  const saveToken = () => {
    const value = tokenDraft.trim();
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
    setToken(value);
    setShowTokenDialog(false);
    setToast(value ? "Access token saved on this device." : "Access token removed.");
  };

  const submitRegistration = async () => {
    if (!token) {
      requestToken();
      return;
    }
    if (!activeEvent) return;
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_id: eventId(activeEvent) }),
      });
      const payload = await readJson(response);
      if (!response.ok) throw new Error(payload.error || `Registration failed (${response.status}).`);
      setToast("You're registered. See you there!");
      await loadEvents();
    } catch (error) {
      setToast(error.message || "Registration could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const loadMyRegistrations = async () => {
    if (!token) {
      requestToken();
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/me/registrations`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await readJson(response);
      if (!response.ok) throw new Error(payload.error || `Unable to load registrations (${response.status}).`);
      if (!Array.isArray(payload)) throw new Error("The registrations endpoint returned an unexpected response.");
      setRegistrations(payload);
      setPage("registrations");
    } catch (error) {
      setToast(error.message || "Unable to load your registrations.");
    } finally {
      setBusy(false);
    }
  };

  const loadAttendees = async (id) => {
    setManifestEventId(id);
    setAttendees([]);
    setManifestError("");
    if (!id) return;
    if (!token) {
      setManifestError("Add an organizer access token to view this event's attendee list.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/events/${encodeURIComponent(id)}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await readJson(response);
      if (!response.ok) throw new Error(payload.error || `Unable to load attendees (${response.status}).`);
      if (!Array.isArray(payload)) throw new Error("The attendee endpoint returned an unexpected response.");
      setAttendees(payload);
    } catch (error) {
      setManifestError(error.message || "Unable to load attendees.");
    } finally {
      setBusy(false);
    }
  };

  const navigate = (nextPage) => {
    if (nextPage === "registrations") {
      loadMyRegistrations();
      return;
    }
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalCapacity = events.reduce((sum, event) => sum + eventCapacity(event), 0);
  const totalRegistered = events.reduce((sum, event) => sum + eventRegistered(event), 0);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); navigate("explore"); }}>
          <span className="brand-mark"><span /></span><span>Event<span className="brand-accent">Pulse</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={page === "explore" || page === "details" ? "nav-link active" : "nav-link"} onClick={() => navigate("explore")}>Explore Events</button>
          <button className={page === "registrations" ? "nav-link active" : "nav-link"} onClick={() => navigate("registrations")}>My Registrations</button>
          <button className={page === "organizer" || page === "manifest" ? "nav-link active" : "nav-link"} onClick={() => navigate("organizer")}>Organizer Portal</button>
          <button className="nav-link documentation-link" onClick={() => navigate("api")}>Documentation &amp; API</button>
        </nav>
        <div className="top-actions">
          <span className="role-pill"><span className="status-dot" />{token ? "Account connected" : "Guest access"}</span>
          <button className="icon-button" aria-label="Manage access token" onClick={requestToken}><Icon name="lock" size={16} /></button>
          <button className="button button-primary button-small" onClick={() => navigate("organizer")}><Icon name="plus" size={15} /> Create event</button>
        </div>
      </header>

      <main>
        {page === "explore" && (
          <ExplorePage events={filteredEvents} total={events.length} loading={loading} error={apiError} query={query}
            statusFilter={statusFilter} sortOrder={sortOrder} setQuery={setQuery} setStatusFilter={setStatusFilter}
            setSortOrder={setSortOrder} onRetry={loadEvents} onOpen={openEvent} />
        )}
        {page === "details" && activeEvent && <DetailsPage event={activeEvent} onBack={() => navigate("explore")} onRegister={submitRegistration} busy={busy} />}
        {page === "registrations" && <RegistrationsPage items={registrations} events={events} busy={busy} onExplore={() => navigate("explore")} />}
        {page === "organizer" && <OrganizerPage events={events} totalCapacity={totalCapacity} totalRegistered={totalRegistered} apiError={apiError} loading={loading} onManifest={() => navigate("manifest")} onOpen={openEvent} />}
        {page === "manifest" && <ManifestPage events={events} selectedId={manifestEventId} attendees={attendees} error={manifestError} busy={busy} onSelect={loadAttendees} onManageToken={requestToken} />}
        {page === "api" && <ApiPage />}
      </main>

      <footer className="footer">
        <span>© 2025 EventPulse Infrastructure Ltd. High-throughput event operations.</span>
        <div><a href="#privacy" onClick={(event) => event.preventDefault()}>Privacy Policy</a><a href="#terms" onClick={(event) => event.preventDefault()}>Terms of Service</a><button onClick={loadEvents}>System status <span className="status-dot" /></button></div>
      </footer>

      {showTokenDialog && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowTokenDialog(false); }}>
        <section className="token-dialog" role="dialog" aria-modal="true" aria-labelledby="token-title">
          <button className="dialog-close" aria-label="Close dialog" onClick={() => setShowTokenDialog(false)}><Icon name="close" /></button>
          <div className="dialog-icon"><Icon name="lock" size={21} /></div>
          <p className="eyebrow">SECURE CONNECTION</p>
          <h2 id="token-title">Connect your account</h2>
          <p className="muted">Use a valid Supabase access token to register for events or view organizer-only attendee information. The token stays in this browser.</p>
          <label className="field-label" htmlFor="access-token">Access token</label>
          <textarea id="access-token" className="token-input" rows="3" value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} placeholder="Paste your bearer access token" autoComplete="off" />
          <div className="dialog-actions"><button className="button button-quiet" onClick={() => { setTokenDraft(""); localStorage.removeItem(TOKEN_KEY); setToken(""); setShowTokenDialog(false); setToast("Access token removed."); }}>Disconnect</button><button className="button button-primary" onClick={saveToken}>Save token</button></div>
        </section>
      </div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function PageIntro({ label, title, description, actions }) {
  return <div className="page-intro"><div><p className="eyebrow">{label}</p><h1>{title}</h1><p className="intro-copy">{description}</p></div>{actions && <div className="intro-actions">{actions}</div>}</div>;
}

function ExplorePage({ events, total, loading, error, query, statusFilter, sortOrder, setQuery, setStatusFilter, setSortOrder, onRetry, onOpen }) {
  const filters = ["All events", "Open", "Filling fast", "Published", "Sold out"];
  return <div className="content-wrap">
    <div className="breadcrumb"><span className="breadcrumb-icon"><Icon name="grid" size={15} /></span><span>Event Registry</span><span className="crumb-slash">/</span><span>Public directory</span><span className="sync-label"><span className={`status-dot ${error ? "offline" : ""}`} /> {error ? "API unavailable" : loading ? "Connecting · API" : "Connected · API"}</span></div>
    <PageIntro label="CATALOG DIRECTORY" title="Explore events" description="Browse upcoming conferences, workshops, and technical gatherings with live transactional availability."
      actions={<><div className="mini-stat"><span>Total live</span><strong>{loading || error ? "—" : total}</strong></div><div className="mini-stat warm"><span>Spots open</span><strong>{loading || error ? "—" : events.reduce((sum, event) => sum + Math.max(0, eventCapacity(event) - eventRegistered(event)), 0).toLocaleString()}</strong></div></>} />
    <section className="filter-panel">
      <div className="filter-row">
        <label className="searchbox"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events by title, organizer, or keywords..." /></label>
        <label className="sort-control"><span>Sort by:</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option>Newest first</option><option>Oldest first</option><option>Name A–Z</option></select></label>
      </div>
      <div className="filter-bottom"><span className="filter-caption">STATUS:</span>{filters.map((filter) => <button key={filter} className={`filter-chip ${statusFilter === filter ? "selected" : ""}`} onClick={() => setStatusFilter(filter)}>{filter === "All events" ? `All statuses (${loading || error ? "—" : total})` : filter}</button>)}</div>
    </section>
    {error && <div className="notice notice-error"><div><strong>Events could not be loaded</strong><p>{error} Check that the Flask API is running at its configured address.</p></div><button className="button button-outline" onClick={onRetry}>Try again</button></div>}
    {loading && <div className="event-grid">{[1, 2, 3].map((item) => <div className="event-skeleton" key={item}><div /><span /><span /></div>)}</div>}
    {!loading && !error && events.length === 0 && <div className="empty-state"><div className="empty-icon"><Icon name="search" size={23} /></div><h2>{query ? "No events match your search" : "No events to show yet"}</h2><p>{query ? "Try changing the search terms or status filter." : "New events will appear here as soon as they're published."}</p>{query && <button className="button button-outline" onClick={() => { setQuery(""); setStatusFilter("All events"); }}>Clear filters</button>}</div>}
    {!loading && !error && events.length > 0 && <div className="event-grid">{events.map((event, index) => <EventCard key={eventId(event) || index} event={event} index={index} onOpen={() => onOpen(event)} />)}</div>}
    {!loading && !error && total > 0 && <div className="results-bar"><span>Showing <strong>{events.length}</strong> of <strong>{total}</strong> events</span><span>Live availability · Updated just now</span></div>}
  </div>;
}

function EventCard({ event, index, onOpen }) {
  const capacity = eventCapacity(event);
  const registered = eventRegistered(event);
  const percentage = capacity ? Math.min(100, Math.round(registered / capacity * 100)) : 0;
  const status = eventStatus(event);
  const themes = ["lavender", "peach", "slate", "mint", "blue", "amber"];
  return <article className="event-card">
    <button className={`event-art ${themes[index % themes.length]}`} onClick={onOpen} aria-label={`View ${eventName(event)}`}>
      <span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><span className="art-spark">✳</span><span className="art-lines" />
      <span className="category-label">{event.category || event.track || "Technology"}</span>
      <span className={`event-status ${status.includes("SOLD") ? "sold" : status.includes("FILL") ? "filling" : ""}`}><span className="status-dot" />{status}</span>
    </button>
    <div className="event-card-content">
      <div className="event-meta"><span className="id-tag">ID: {eventId(event).slice(0, 12) || "EVENT"}</span><span>{event.organizer_name || event.organizer || "EventPulse"}</span></div>
      <h2><button onClick={onOpen}>{eventName(event)}</button></h2>
      <p className="event-description">{eventDescription(event)}</p>
      <div className="event-when"><span><Icon name="calendar" size={15} />{formatDate(eventDate(event))}</span><span><Icon name="pin" size={15} />{eventLocation(event)}</span></div>
      {capacity > 0 && <div className="capacity-block"><div className="capacity-caption"><span>Seat allocation</span><span>{registered} / {capacity} spots</span></div><div className="progress-track"><span style={{ width: `${percentage}%` }} /></div><div className="capacity-foot">{percentage}% capacity filled</div></div>}
      <button className={`button card-cta ${status.includes("SOLD") ? "button-soft" : "button-primary"}`} onClick={onOpen}>{status.includes("SOLD") ? "View details" : "View details & register"}<Icon name="arrow" size={16} /></button>
    </div>
  </article>;
}

function DetailsPage({ event, onBack, onRegister, busy }) {
  const capacity = eventCapacity(event);
  const registered = eventRegistered(event);
  const seatsLeft = capacity ? Math.max(0, capacity - registered) : null;
  return <div className="content-wrap detail-wrap">
    <button className="back-link" onClick={onBack}>← Back to explore</button>
    <div className="detail-layout">
      <div className="detail-main">
        <div className="detail-hero"><div className="hero-glow" /><div className="hero-kicker"><span className="status-dot" />{eventStatus(event)} <span className="hero-divider">·</span> EVENT DETAILS</div><h1>{eventName(event)}</h1><p>{eventDescription(event)}</p><div className="hero-facts"><span><Icon name="calendar" />{formatDate(eventDate(event))}</span><span><Icon name="pin" />{eventLocation(event)}</span><span><Icon name="users" />{event.organizer_name || event.organizer || "Event organizer"}</span></div></div>
        <section className="detail-section"><p className="eyebrow">THE EXPERIENCE</p><h2>Make room for what’s next.</h2><p className="body-copy">{eventDescription(event)} Join a community of curious people for thoughtful conversations, practical ideas, and new connections.</p><div className="experience-grid"><div><span className="feature-mark purple"><Icon name="users" /></span><strong>People worth meeting</strong><p>Connect with experts and peers in your field.</p></div><div><span className="feature-mark orange"><Icon name="chart" /></span><strong>Ideas you can use</strong><p>Take home perspectives built for real work.</p></div><div><span className="feature-mark green"><Icon name="check" /></span><strong>A smooth arrival</strong><p>Clear event details, all in one place.</p></div></div></section>
        <section className="detail-section location-section"><div><p className="eyebrow">LOCATION &amp; ACCESS</p><h2>Getting there</h2><p className="muted">{eventLocation(event)}</p></div><div className="map-illustration"><span className="map-road road-a" /><span className="map-road road-b" /><span className="map-road road-c" /><span className="map-pin"><Icon name="pin" size={19} /></span><span className="map-caption"><Icon name="pin" size={13} /> {eventLocation(event)}</span></div></section>
      </div>
      <aside className="detail-sidebar"><div className="registration-card"><div className="card-title-row"><h2>Event registration</h2><span className="live-tag"><span className="status-dot" /> Live</span></div><div className="availability-box"><div className="capacity-caption"><span>Capacity allocation</span><strong>{capacity ? `${registered} / ${capacity}` : "Open registration"}</strong></div>{capacity > 0 && <><div className="progress-track"><span style={{ width: `${Math.min(100, registered / capacity * 100)}%` }} /></div><div className="capacity-foot">{Math.round(registered / capacity * 100)}% filled</div></>}</div><div className="seat-summary"><div><span>Seats available</span><strong className={seatsLeft === 0 ? "text-danger" : "text-orange"}>{seatsLeft === null ? "—" : seatsLeft.toLocaleString()}</strong></div><span>{seatsLeft === 0 ? "This event is full" : seatsLeft === null ? "Capacity not specified" : "Limited availability"}</span></div><div className="price-row"><span>Registration tier</span><strong>{event.ticket_type || event.tier || "Standard pass"} <small>· {event.price ? `$${event.price}` : "Free"}</small></strong></div><button className="button button-orange register-button" disabled={busy || seatsLeft === 0} onClick={onRegister}><Icon name="ticket" size={16} />{busy ? "Processing…" : seatsLeft === 0 ? "Event is full" : "Register for event"}</button><p className="secure-note"><Icon name="lock" size={13} /> Secure registration · confirmation is instant</p><ul className="benefit-list"><li><Icon name="check" />Event updates in one place</li><li><Icon name="check" />A verified attendee record</li><li><Icon name="check" />Manage your registration anytime</li></ul></div><div className="api-contract"><div className="contract-heading"><span><Icon name="grid" size={14} /> API integration</span><span className="method-tag">POST</span></div><code><span>// Registration endpoint</span><br />POST /api/registrations<br /><br />Authorization: Bearer &lt;token&gt;<br />{"{"}<br />&nbsp;&nbsp;"event_id": "{eventId(event)}"<br />{"}"}</code><div className="contract-foot">Requires a valid attendee access token.</div></div></aside>
    </div>
  </div>;
}

function RegistrationsPage({ items, events, busy, onExplore }) {
  return <div className="content-wrap"><PageIntro label="YOUR EVENT SPACE" title="My registrations" description="Your upcoming events and confirmed places, all together." />
    {busy ? <div className="empty-state"><div className="spinner" /><p>Loading your registrations…</p></div> : items.length === 0 ? <div className="empty-state"><div className="empty-icon"><Icon name="ticket" size={23} /></div><h2>No registrations yet</h2><p>When you register for an event, it will show up here.</p><button className="button button-primary" onClick={onExplore}>Explore events <Icon name="arrow" size={15} /></button></div> :
      <div className="registration-list">{items.map((item, index) => {
        const event = events.find((candidate) => eventId(candidate) === String(item.event_id)) || {};
        return <article className="registration-row" key={item.id || `${item.event_id}-${index}`}><div className="registration-icon"><Icon name="calendar" size={20} /></div><div className="registration-info"><h2>{eventName(event)}</h2><p>{formatDate(eventDate(event))} <span>·</span> {eventLocation(event)}</p></div><span className="confirmed-pill"><Icon name="check" size={13} /> Confirmed</span></article>;
      })}</div>}
  </div>;
}

function OrganizerPage({ events, totalCapacity, totalRegistered, apiError, loading, onManifest, onOpen }) {
  const openEvents = events.filter((event) => !eventStatus(event).includes("SOLD")).length;
  const fillRate = totalCapacity ? Math.round(totalRegistered / totalCapacity * 100) : 0;
  return <div className="content-wrap organizer-wrap">
    <div className="organizer-context"><span className="role-pill"><span className="status-dot" /> Role: Organizer</span><span>Event data is loaded from the API</span><span className="sync-label"><span className={`status-dot ${apiError ? "offline" : ""}`} />{apiError ? "API unavailable" : loading ? "Connecting…" : "GET /api/events · 200 OK"}</span></div>
    <PageIntro label="ORGANIZER PORTAL / OVERVIEW" title="Manage your hosted events" description="Monitor live capacity, review event details, and open attendee manifests."
      actions={<><button className="button button-outline" onClick={onManifest}><Icon name="users" size={15} /> Attendee manifest</button><button className="button button-orange" onClick={() => window.alert("Event creation is not available in the current API.")}><Icon name="plus" size={15} /> Create new event</button></>} />
    <div className="metric-grid">
      <MetricCard label="Total events hosted" value={events.length} sub="Across your workspace" icon="calendar" tone="purple" />
      <MetricCard label="Aggregate capacity" value={totalCapacity.toLocaleString()} sub="Seats allocated" icon="ticket" tone="purple" />
      <MetricCard label="Total registered" value={totalRegistered.toLocaleString()} sub={`${fillRate}% of known capacity`} icon="users" tone="orange" />
      <MetricCard label="Available remaining" value={Math.max(0, totalCapacity - totalRegistered).toLocaleString()} sub="Seats open" icon="check" tone="green" />
    </div>
    {apiError && <div className="notice notice-error"><div><strong>Event data could not be loaded</strong><p>{apiError} Start the Flask service and refresh to load organizer metrics.</p></div></div>}
    <div className="ops-grid"><section className="ops-card hub-card"><span className="eyebrow">EVENT OPERATIONS</span><h2>Keep every gathering moving.</h2><p>Explore your event list, review live capacity, and open attendee records for the events you organize.</p><div className="ops-actions"><button className="button button-primary" onClick={onManifest}><Icon name="users" size={15} /> View attendee manifest</button><span><span className="status-dot" /> {openEvents} active events</span></div></section><section className="ops-card sync-card"><div className="card-title-row"><h2>API connection</h2><span className="live-tag"><span className="status-dot" /> Connected</span></div><p>Event data is read from the configured Flask service.</p><code>GET {API_URL}/api/events</code><div className="sync-foot">Capacity metrics reflect fields available from the API.</div></section></div>
    <section className="table-section"><div className="table-heading"><div><p className="eyebrow">EVENT REGISTRY</p><h2>Events in your workspace</h2></div><span className="count-pill">{events.length} events</span></div>
      {events.length === 0 ? <p className="table-empty">Events will appear here once they are available from the API.</p> : <div className="table-scroll"><table><thead><tr><th>Event title &amp; identifier</th><th>Status</th><th>Capacity</th><th>Registration volume</th><th>Actions</th></tr></thead><tbody>{events.map((event, index) => {
        const capacity = eventCapacity(event);
        const registered = eventRegistered(event);
        const percent = capacity ? Math.min(100, Math.round(registered / capacity * 100)) : 0;
        return <tr key={eventId(event) || index}><td><button className="table-event-title" onClick={() => onOpen(event)}><span className={`event-avatar avatar-${index % 4}`}>{eventName(event).slice(0, 2).toUpperCase()}</span><span><strong>{eventName(event)}</strong><small>ID: {eventId(event) || "—"}</small></span></button></td><td><span className="table-status"><span className="status-dot" />{eventStatus(event)}</span></td><td>{capacity ? `${capacity} seats` : "Not specified"}</td><td><div className="table-capacity"><span>{registered} registered</span>{capacity > 0 && <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>}</div></td><td><button className="button button-soft button-table" onClick={() => onOpen(event)}>View details <Icon name="arrow" size={13} /></button></td></tr>;
      })}</tbody></table></div>}
    </section>
    <div className="support-cards"><section className="support-card"><span className="support-icon orange"><Icon name="chart" /></span><div><h3>Capacity guard</h3><p>Track seat availability and registration pace across hosted events.</p></div></section><section className="support-card"><span className="support-icon purple"><Icon name="refresh" /></span><div><h3>Webhook &amp; sync feeds</h3><p>Event data is retrieved live from the service when you load this portal.</p></div></section></div>
  </div>;
}

function MetricCard({ label, value, sub, icon, tone }) {
  return <section className="metric-card"><div className="metric-heading"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon name={icon} size={16} /></span></div><strong>{value}</strong><p>{sub}</p></section>;
}

function ManifestPage({ events, selectedId, attendees, error, busy, onSelect, onManageToken }) {
  const selectedEvent = events.find((event) => eventId(event) === selectedId);
  return <div className="content-wrap organizer-wrap">
    <div className="organizer-context"><span className="role-pill"><span className="status-dot" /> Role: Organizer</span><span>Attendee data is access controlled</span></div>
    <PageIntro label="ORGANIZER PORTAL / EVENTS / ATTENDEES" title="Attendee manifest" description="Review event registrations and verify attendee records."
      actions={<button className="button button-outline" onClick={onManageToken}><Icon name="lock" size={15} /> Manage access</button>} />
    <section className="manifest-toolbar"><label className="field-label" htmlFor="manifest-event">Select event</label><select id="manifest-event" value={selectedId} onChange={(event) => onSelect(event.target.value)}><option value="">Choose an event…</option>{events.map((event, index) => <option value={eventId(event)} key={eventId(event) || index}>{eventName(event)}</option>)}</select>{selectedEvent && <span className="count-pill">{attendees.length} registrations</span>}</section>
    {error && <div className="notice notice-error"><div><strong>Attendee list unavailable</strong><p>{error}</p></div></div>}
    {busy && <div className="empty-state"><div className="spinner" /><p>Loading attendee records…</p></div>}
    {!busy && selectedEvent && !error && <section className="table-section manifest-table"><div className="table-heading"><div><p className="eyebrow">{eventName(selectedEvent)}</p><h2>Registered attendees</h2></div><span className="live-tag"><span className="status-dot" /> Live</span></div>
      {attendees.length === 0 ? <div className="table-empty">No attendee registrations were returned for this event.</div> : <div className="table-scroll"><table><thead><tr><th>Registration ID</th><th>Attendee</th><th>Event ID</th><th>Verification</th></tr></thead><tbody>{attendees.map((attendee, index) => <tr key={attendee.id || `${attendee.user_id}-${index}`}><td><span className="id-tag">{attendee.id || `REG-${index + 1}`}</span></td><td><strong>{attendee.name || attendee.full_name || attendee.email || attendee.user_id || "Attendee"}</strong>{attendee.email && <small className="table-subline">{attendee.email}</small>}</td><td><span className="id-tag">{attendee.event_id || selectedId}</span></td><td><span className="confirmed-pill"><Icon name="check" size={13} /> Confirmed</span></td></tr>)}</tbody></table></div>}
    </section>}
  </div>;
}

function ApiPage() {
  return <div className="content-wrap"><PageIntro label="DEVELOPER RESOURCES" title="Documentation & API" description="The EventPulse frontend communicates with the Flask API using the endpoints below." />
    <div className="api-doc-grid"><section className="api-doc-card"><span className="method-tag get">GET</span><code>/api/events</code><p>Browse all events available in the public directory.</p></section><section className="api-doc-card"><span className="method-tag get">GET</span><code>/api/events/&lt;event_id&gt;</code><p>Retrieve the details for an individual event.</p></section><section className="api-doc-card"><span className="method-tag post">POST</span><code>/api/registrations</code><p>Create a registration. Requires a Bearer access token and an event_id.</p></section><section className="api-doc-card"><span className="method-tag get">GET</span><code>/api/me/registrations</code><p>List registrations for the authenticated attendee.</p></section><section className="api-doc-card"><span className="method-tag get">GET</span><code>/api/events/&lt;event_id&gt;/registrations</code><p>Organizer-only attendee list. Requires an authenticated event owner.</p></section></div>
    <div className="notice notice-info"><div><strong>API base URL</strong><p>This frontend uses <code>{API_URL}</code>. Set <code>VITE_API_URL</code> in your environment to point to a different Flask server.</p></div></div>
  </div>;
}

export default App;
