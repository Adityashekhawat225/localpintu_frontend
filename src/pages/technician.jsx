import "../styles/luxurySystem.css";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { technicianJobAction, technicianLogin, technicianLogout, technicianMyJobs } from "../services/api";
import "../styles/auth.css";

const KEY = "localpintu-technician";
const readSession = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
export function TechnicianLoginPage() {
  const [form, setForm] = useState({ emailOrMobile: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { const data = await technicianLogin(form); localStorage.setItem(KEY, JSON.stringify(data)); navigate("/technician/dashboard"); } catch (requestError) { setError(requestError.message); } finally { setBusy(false); } };
  return <main className="auth-page"><section className="auth-card"><Link to="/">? Back to home</Link><h1>Technician Login</h1>{error ? <p className="auth-error">{error}</p> : null}<form onSubmit={submit}><input placeholder="Email or mobile number" value={form.emailOrMobile} onChange={(event) => setForm({ ...form, emailOrMobile: event.target.value })} required /><input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><button disabled={busy}>{busy ? "Signing in..." : "Log in"}</button></form></section></main>;
}
export function TechnicianDashboardPage() {
  const session = readSession();
  if (!session.token) return <Navigate to="/technician/login" replace />;
  return <TechnicianJobs token={session.token} technician={session.technician} />;
}
function TechnicianJobs({ token, technician }) {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { jobId } = useParams();
  const load = useCallback(async () => { setLoading(true); try { setJobs(await technicianMyJobs(token)); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }, [token]);
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, [load]);
  const action = async (id, name) => { try { await technicianJobAction(token, id, name); await load(); } catch (requestError) { setError(requestError.message); } };
  const logout = async () => { try { await technicianLogout(token); } finally { localStorage.removeItem(KEY); navigate("/technician/login"); } };
  const selected = jobs.find((job) => job._id === jobId) || jobs[0];
  return <main className="auth-page technician-page"><section className="auth-card technician-card"><Link to="/">? Back to home</Link><div className="technician-heading"><div><h1>Technician Dashboard</h1><p>{technician?.fullName || "Technician"}</p></div><button type="button" className="auth-secondary" onClick={logout}>Log out</button></div>{error ? <p className="auth-error">{error}</p> : null}{loading ? <p>Loading assigned jobs...</p> : null}{!loading && !jobs.length ? <p>No assigned jobs.</p> : null}<div className="technician-jobs">{jobs.map((job) => <Link key={job._id} to={`/technician/jobs/${job._id}`} className={selected?._id === job._id ? "technician-job active" : "technician-job"}><strong>{job.bookingNumber}</strong><span>{job.applianceServiceId?.title || "Service"} · {job.status}</span></Link>)}</div>{selected ? <section className="technician-detail"><h2>Job Details</h2><p><strong>Customer:</strong> {selected.customer?.name}</p><p><strong>Mobile:</strong> {selected.customer?.mobileNumber}</p><p><strong>Address:</strong> {selected.customer?.address}, {selected.cityId?.name || ""}</p><p><strong>Schedule:</strong> {new Date(selected.bookingDate).toLocaleDateString("en-IN")} · {selected.timeSlot}</p><p><strong>Problem:</strong> {selected.customer?.problemDescription}</p><div className="technician-actions">{selected.status === "Assigned" ? <><button onClick={() => action(selected._id, "accept")}>Accept Job</button><button className="auth-secondary" onClick={() => action(selected._id, "reject")}>Reject Job</button></> : null}{selected.status === "In Progress" ? <button onClick={() => action(selected._id, "done")}>Complete Job</button> : null}{["Completed", "Pending"].includes(selected.status) ? <p>Current job status: {selected.status}</p> : null}</div></section> : null}</section></main>;
}
