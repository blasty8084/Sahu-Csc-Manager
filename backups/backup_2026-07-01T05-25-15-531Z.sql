--
-- PostgreSQL database dump
--

\restrict cpkJiDWxPHFy1kZCxqjBVXiIZFV5HHSf8cWxab1i9MY5Q0MQU6KBTxMGnjymOCC

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aeps_daily; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aeps_daily (
    id integer NOT NULL,
    date date NOT NULL,
    created_by integer NOT NULL,
    opening_balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.aeps_daily OWNER TO postgres;

--
-- Name: aeps_daily_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aeps_daily_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aeps_daily_id_seq OWNER TO postgres;

--
-- Name: aeps_daily_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aeps_daily_id_seq OWNED BY public.aeps_daily.id;


--
-- Name: aeps_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aeps_transactions (
    id integer NOT NULL,
    daily_id integer NOT NULL,
    type text NOT NULL,
    amount numeric(12,2) NOT NULL,
    customer_name text NOT NULL,
    description text,
    receipt_token text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.aeps_transactions OWNER TO postgres;

--
-- Name: aeps_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aeps_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aeps_transactions_id_seq OWNER TO postgres;

--
-- Name: aeps_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aeps_transactions_id_seq OWNED BY public.aeps_transactions.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    details text,
    ip_address text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: backups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backups (
    id integer NOT NULL,
    filename text NOT NULL,
    size integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.backups OWNER TO postgres;

--
-- Name: backups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backups_id_seq OWNER TO postgres;

--
-- Name: backups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backups_id_seq OWNED BY public.backups.id;


--
-- Name: broadcast_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broadcast_logs (
    id integer NOT NULL,
    sent_by integer NOT NULL,
    channel text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    recipient_filter text,
    recipient_count integer DEFAULT 0 NOT NULL,
    failed_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.broadcast_logs OWNER TO postgres;

--
-- Name: broadcast_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.broadcast_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.broadcast_logs_id_seq OWNER TO postgres;

--
-- Name: broadcast_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.broadcast_logs_id_seq OWNED BY public.broadcast_logs.id;


--
-- Name: email_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_otps (
    id integer NOT NULL,
    email text NOT NULL,
    purpose text NOT NULL,
    otp_hash text NOT NULL,
    verified_token text,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text
);


ALTER TABLE public.email_otps OWNER TO postgres;

--
-- Name: email_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_otps_id_seq OWNER TO postgres;

--
-- Name: email_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_otps_id_seq OWNED BY public.email_otps.id;


--
-- Name: ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ledger (
    id integer NOT NULL,
    date text NOT NULL,
    customer_name text NOT NULL,
    service_type text NOT NULL,
    credit numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    debit numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    created_by integer NOT NULL,
    receipt_number text,
    receipt_token text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ledger OWNER TO postgres;

--
-- Name: ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ledger_id_seq OWNER TO postgres;

--
-- Name: ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ledger_id_seq OWNED BY public.ledger.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    link text,
    meta jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.push_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.push_subscriptions OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.push_subscriptions_id_seq OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: receipt_counters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipt_counters (
    year integer NOT NULL,
    last_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.receipt_counters OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    price numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    category text DEFAULT 'General'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: udhari_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udhari_customers (
    id integer NOT NULL,
    name text NOT NULL,
    mobile text,
    address text,
    notes text,
    balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.udhari_customers OWNER TO postgres;

--
-- Name: udhari_customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udhari_customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udhari_customers_id_seq OWNER TO postgres;

--
-- Name: udhari_customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udhari_customers_id_seq OWNED BY public.udhari_customers.id;


--
-- Name: udhari_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.udhari_entries (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    date text NOT NULL,
    type text NOT NULL,
    amount numeric(12,2) NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    receipt_token text,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.udhari_entries OWNER TO postgres;

--
-- Name: udhari_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.udhari_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.udhari_entries_id_seq OWNER TO postgres;

--
-- Name: udhari_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.udhari_entries_id_seq OWNED BY public.udhari_entries.id;


--
-- Name: user_notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notification_preferences (
    id integer NOT NULL,
    user_id integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    security_alerts boolean DEFAULT true NOT NULL,
    business_alerts boolean DEFAULT true NOT NULL,
    system_alerts boolean DEFAULT true NOT NULL,
    info_alerts boolean DEFAULT true NOT NULL,
    push_enabled boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_notification_preferences OWNER TO postgres;

--
-- Name: user_notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_notification_preferences_id_seq OWNER TO postgres;

--
-- Name: user_notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_notification_preferences_id_seq OWNED BY public.user_notification_preferences.id;


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preferences (
    id integer NOT NULL,
    user_id integer NOT NULL,
    theme text DEFAULT 'light'::text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    dashboard_layout text DEFAULT 'default'::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_preferences OWNER TO postgres;

--
-- Name: user_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_preferences_id_seq OWNER TO postgres;

--
-- Name: user_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_preferences_id_seq OWNED BY public.user_preferences.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    session_id text NOT NULL,
    device_info text,
    browser text,
    os text,
    ip_address text,
    is_active boolean DEFAULT true NOT NULL,
    remember_me boolean DEFAULT false NOT NULL,
    last_activity timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_sessions_id_seq OWNER TO postgres;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    mobile text,
    full_name text,
    password_hash text NOT NULL,
    role text DEFAULT 'operator'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone,
    rejection_reason text,
    profile_picture text,
    bio text,
    address text,
    active_session_token text,
    appeal_submitted_at timestamp with time zone,
    appeal_dismissed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: aeps_daily id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aeps_daily ALTER COLUMN id SET DEFAULT nextval('public.aeps_daily_id_seq'::regclass);


--
-- Name: aeps_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aeps_transactions ALTER COLUMN id SET DEFAULT nextval('public.aeps_transactions_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: backups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups ALTER COLUMN id SET DEFAULT nextval('public.backups_id_seq'::regclass);


--
-- Name: broadcast_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broadcast_logs ALTER COLUMN id SET DEFAULT nextval('public.broadcast_logs_id_seq'::regclass);


--
-- Name: email_otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_otps ALTER COLUMN id SET DEFAULT nextval('public.email_otps_id_seq'::regclass);


--
-- Name: ledger id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger ALTER COLUMN id SET DEFAULT nextval('public.ledger_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: push_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.push_subscriptions_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: udhari_customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udhari_customers ALTER COLUMN id SET DEFAULT nextval('public.udhari_customers_id_seq'::regclass);


--
-- Name: udhari_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udhari_entries ALTER COLUMN id SET DEFAULT nextval('public.udhari_entries_id_seq'::regclass);


--
-- Name: user_notification_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_notification_preferences_id_seq'::regclass);


--
-- Name: user_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_preferences_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: aeps_daily; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aeps_daily (id, date, created_by, opening_balance, notes, created_at, updated_at) FROM stdin;
1	2026-06-30	1	50000.00	\N	2026-06-30 15:59:56.952222+00	2026-06-30 15:59:56.952222+00
\.


--
-- Data for Name: aeps_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aeps_transactions (id, daily_id, type, amount, customer_name, description, receipt_token, created_at) FROM stdin;
1	1	withdrawal	5000.00	Tgh	Central Bank of India · Aadhaar XXXX9999	40dce855-0c20-4324-8328-39c748f989c6	2026-06-30 16:00:12.216493+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, details, ip_address, created_at) FROM stdin;
1	1	login.failed_password	Wrong password attempt 1/5 from Chrome on Android	49.42.223.160	2026-07-01 04:59:58.813954+00
2	1	login	Logged in from Chrome on Android	49.42.223.160	2026-07-01 05:00:06.886675+00
3	1	logout	User logged out	49.42.223.160	2026-07-01 05:04:09.29037+00
4	2	login	Logged in from Chrome on Android	49.42.223.160	2026-07-01 05:04:25.855469+00
5	2	preferences.update	User updated preferences	49.42.223.160	2026-07-01 05:04:45.720253+00
6	2	logout	User logged out	49.42.223.160	2026-07-01 05:05:18.290314+00
7	1	login	Logged in from Chrome on Android	49.42.223.160	2026-07-01 05:05:49.392669+00
8	1	settings.update	Updated system settings	49.42.223.160	2026-07-01 05:06:42.242178+00
9	1	preferences.update	User updated preferences	49.42.223.160	2026-07-01 05:07:00.360612+00
10	1	logout	User logged out	49.42.223.160	2026-07-01 05:16:28.072967+00
11	2	login	Logged in from Chrome on Android	49.42.223.160	2026-07-01 05:17:19.826735+00
12	2	logout	User logged out	49.42.223.160	2026-07-01 05:21:07.783275+00
13	1	login	Logged in from Chrome on Android	49.42.223.160	2026-07-01 05:24:24.773188+00
14	1	backup.delete	Deleted backup: backup_2026-06-16T07-05-40-015Z.sql	49.42.223.160	2026-07-01 05:24:52.332329+00
15	1	backup.delete	Deleted backup: backup_2026-06-19T02-10-08-281Z.sql	49.42.223.160	2026-07-01 05:24:55.582167+00
16	1	backup.delete	Deleted backup: backup_2026-06-30T13-45-16-291Z.sql	49.42.223.160	2026-07-01 05:24:59.237867+00
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backups (id, filename, size, created_at) FROM stdin;
4	backup_2026-06-30T16-00-32-656Z.sql	49151	2026-06-30 16:00:32+00
\.


--
-- Data for Name: broadcast_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broadcast_logs (id, sent_by, channel, subject, body, recipient_filter, recipient_count, failed_count, created_at) FROM stdin;
\.


--
-- Data for Name: email_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_otps (id, email, purpose, otp_hash, verified_token, expires_at, used_at, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ledger (id, date, customer_name, service_type, credit, debit, description, balance, created_by, receipt_number, receipt_token, created_at, updated_at) FROM stdin;
1	2026-06-30	Gghh	Residence Certificate	0.00	0.00		0.00	1	CSC-2026-0001	2be9f70a-dfab-4b37-8e5a-bc35d4dbcd2a	2026-06-30 15:59:32.045558+00	2026-06-30 15:59:32.045558+00
2	2026-06-30	Ffgg	Income Certificate	5000.00	0.00		5000.00	1	CSC-2026-0002	01561331-32ef-4551-a8d2-8ed58482ff7c	2026-06-30 15:59:46.574991+00	2026-06-30 15:59:46.574991+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, priority, is_read, read_at, link, meta, created_at) FROM stdin;
1	\N	Welcome to SAHU CSC!	Your Common Service Center management platform is ready. Start by adding ledger entries.	success	MEDIUM	f	\N	\N	\N	2026-07-01 04:59:25.452264+00
2	1	Failed Login Attempt	Failed password attempt 1/5 from Chrome on Android (49.42.223.160).	security	HIGH	f	\N	\N	{"ip": "49.42.223.160", "device": "Chrome on Android", "attemptCount": 1}	2026-07-01 04:59:58.843545+00
3	1	Login Successful	You logged in from Chrome on Android (49.42.223.160).	security	MEDIUM	f	\N	\N	{"ip": "49.42.223.160", "device": "Chrome on Android"}	2026-07-01 05:00:06.892368+00
4	2	Login Successful	You logged in from Chrome on Android (49.42.223.160).	security	MEDIUM	f	\N	\N	{"ip": "49.42.223.160", "device": "Chrome on Android"}	2026-07-01 05:04:25.861429+00
5	1	Login Successful	You logged in from Chrome on Android (49.42.223.160).	security	MEDIUM	f	\N	\N	{"ip": "49.42.223.160", "device": "Chrome on Android"}	2026-07-01 05:05:49.396975+00
6	1	Login Successful	You logged in from Chrome on Android (49.42.223.160).	security	MEDIUM	f	\N	\N	{"ip": "49.42.223.160", "device": "Chrome on Android"}	2026-07-01 05:24:24.778494+00
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.push_subscriptions (id, user_id, endpoint, p256dh, auth, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: receipt_counters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receipt_counters (year, last_count) FROM stdin;
2026	2
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, description, price, category, is_active, created_at, updated_at) FROM stdin;
1	PAN Card	PAN card application and correction	107.00	Government ID	t	2026-07-01 04:59:25.341876+00	2026-07-01 04:59:25.341876+00
2	Aadhaar Update	Aadhaar card update and correction	50.00	Government ID	t	2026-07-01 04:59:25.348936+00	2026-07-01 04:59:25.348936+00
3	Voter ID	Voter ID card enrollment and correction	0.00	Government ID	t	2026-07-01 04:59:25.353416+00	2026-07-01 04:59:25.353416+00
4	Passport Application	Passport application assistance	500.00	Government ID	t	2026-07-01 04:59:25.35942+00	2026-07-01 04:59:25.35942+00
5	Driving License	DL application and renewal	300.00	Government ID	t	2026-07-01 04:59:25.362489+00	2026-07-01 04:59:25.362489+00
6	Income Certificate	Income certificate from state govt	30.00	Certificates	t	2026-07-01 04:59:25.365832+00	2026-07-01 04:59:25.365832+00
7	Caste Certificate	Caste certificate application	30.00	Certificates	t	2026-07-01 04:59:25.368815+00	2026-07-01 04:59:25.368815+00
8	Residence Certificate	Residence proof certificate	30.00	Certificates	t	2026-07-01 04:59:25.372535+00	2026-07-01 04:59:25.372535+00
9	Birth Certificate	Birth certificate correction/copy	50.00	Certificates	t	2026-07-01 04:59:25.375672+00	2026-07-01 04:59:25.375672+00
10	Insurance Premium	Life / health insurance premium payment	20.00	Insurance & Finance	t	2026-07-01 04:59:25.378355+00	2026-07-01 04:59:25.378355+00
11	Loan Application	Bank loan application assistance	200.00	Insurance & Finance	t	2026-07-01 04:59:25.381162+00	2026-07-01 04:59:25.381162+00
12	Bank Account Opening	Zero-balance savings account	0.00	Insurance & Finance	t	2026-07-01 04:59:25.384695+00	2026-07-01 04:59:25.384695+00
13	Electricity Bill	Electricity bill payment	10.00	Utility Bills	t	2026-07-01 04:59:25.387641+00	2026-07-01 04:59:25.387641+00
14	Water Bill	Water supply bill payment	10.00	Utility Bills	t	2026-07-01 04:59:25.3904+00	2026-07-01 04:59:25.3904+00
15	Mobile Recharge	Prepaid mobile recharge	5.00	Utility Bills	t	2026-07-01 04:59:25.393005+00	2026-07-01 04:59:25.393005+00
16	DTH Recharge	DTH / cable TV recharge	10.00	Utility Bills	t	2026-07-01 04:59:25.396318+00	2026-07-01 04:59:25.396318+00
17	PMKVY Enrollment	Skill training enrollment	0.00	Government Schemes	t	2026-07-01 04:59:25.399196+00	2026-07-01 04:59:25.399196+00
18	PM Kisan	PM Kisan beneficiary registration	0.00	Government Schemes	t	2026-07-01 04:59:25.402224+00	2026-07-01 04:59:25.402224+00
19	Ayushman Bharat	Health card registration	30.00	Government Schemes	t	2026-07-01 04:59:25.405349+00	2026-07-01 04:59:25.405349+00
20	Photo Print	Passport size photo printing	30.00	Other Services	t	2026-07-01 04:59:25.40905+00	2026-07-01 04:59:25.40905+00
21	Photocopy	Document photocopying	2.00	Other Services	t	2026-07-01 04:59:25.412537+00	2026-07-01 04:59:25.412537+00
22	Scanning	Document scanning	10.00	Other Services	t	2026-07-01 04:59:25.415265+00	2026-07-01 04:59:25.415265+00
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
IcJgL_rzxslkg_0gvmxXnr5gelMtfloi	{"cookie":{"originalMaxAge":28800000,"expires":"2026-06-30T21:20:57.069Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1,"userRole":"admin","sessionToken":"8c08253d-6719-4d4d-8390-dd3e10608054","sessionId":"8c08253d-6719-4d4d-8390-dd3e10608054"}	2026-07-01 00:00:32
C-0u83LhA_SY8D0NQfvEF6vmIl3R2WbX	{"cookie":{"originalMaxAge":28800000,"expires":"2026-07-01T13:24:24.782Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1,"userRole":"admin","sessionToken":"88b2a5de-6643-4051-ad06-1dbc103a2bf4","sessionId":"88b2a5de-6643-4051-ad06-1dbc103a2bf4"}	2026-07-01 13:25:06
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, updated_at) FROM stdin;
10	backupEnabled	true	2026-07-01 05:03:31.609155+00
11	backupFrequency	daily	2026-07-01 05:03:31.609155+00
12	backupTime	02:00	2026-07-01 05:03:31.609155+00
13	backupDays	0	2026-07-01 05:03:31.609155+00
14	backupRetention	30	2026-07-01 05:03:31.609155+00
15	registration_open	false	2026-07-01 05:06:34.152737+00
1	businessName	SAHU CSC Center	2026-07-01 05:06:42.209+00
2	businessAddress	Village Road, Block HQ, Dist-XXX, Odisha - 000000	2026-07-01 05:06:42.213+00
3	businessMobile	9876543210	2026-07-01 05:06:42.217+00
4	businessEmail	admin@sahucsc.in	2026-07-01 05:06:42.221+00
5	language	en	2026-07-01 05:06:42.225+00
6	theme	light	2026-07-01 05:06:42.228+00
7	currency	INR	2026-07-01 05:06:42.232+00
8	autoBackup	false	2026-07-01 05:06:42.235+00
9	backupFrequencyDays	7	2026-07-01 05:06:42.238+00
\.


--
-- Data for Name: udhari_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udhari_customers (id, name, mobile, address, notes, balance, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: udhari_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.udhari_entries (id, customer_id, date, type, amount, note, receipt_token, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_notification_preferences (id, user_id, enabled, security_alerts, business_alerts, system_alerts, info_alerts, push_enabled, updated_at) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preferences (id, user_id, theme, language, dashboard_layout, updated_at) FROM stdin;
1	2	light	or	default	2026-07-01 05:04:45.715+00
2	1	light	en	default	2026-07-01 05:07:00.356+00
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, session_id, device_info, browser, os, ip_address, is_active, remember_me, last_activity, expires_at, created_at) FROM stdin;
1	1	b6bc5e6d-5008-4662-b066-df484285ef94	Chrome on Android	Chrome	Android	49.42.223.160	f	f	2026-07-01 05:03:59.76+00	2026-07-01 13:00:06.873+00	2026-07-01 05:00:06.879228+00
2	2	8b86ae9f-327b-4bfc-a956-01addbf56211	Chrome on Android	Chrome	Android	49.42.223.160	f	f	2026-07-01 05:04:25.849553+00	2026-07-01 13:04:25.84+00	2026-07-01 05:04:25.849553+00
3	1	a13b2c9e-2921-4c8f-a607-9bf5737b88c1	Chrome on Android	Chrome	Android	49.42.223.160	f	f	2026-07-01 05:15:42.823+00	2026-07-01 13:05:49.38+00	2026-07-01 05:05:49.388346+00
4	2	ed309f69-23e6-4678-a750-04dc178c3373	Chrome on Android	Chrome	Android	49.42.223.160	f	f	2026-07-01 05:20:45.549+00	2026-07-01 13:17:19.783+00	2026-07-01 05:17:19.822505+00
5	1	88b2a5de-6643-4051-ad06-1dbc103a2bf4	Chrome on Android	Chrome	Android	49.42.223.160	t	f	2026-07-01 05:24:24.769291+00	2026-07-01 13:24:24.735+00	2026-07-01 05:24:24.769291+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, mobile, full_name, password_hash, role, is_active, status, failed_login_attempts, locked_until, rejection_reason, profile_picture, bio, address, active_session_token, appeal_submitted_at, appeal_dismissed_at, created_at, updated_at) FROM stdin;
2	operator	operator@sahucsc.in	9876543211	CSC Operator	$2b$12$a5PhyrlohrgfweWNcX80Q.j/YBxH7A8u0JXDbc6UDNm/vLymCzbgm	operator	t	ACTIVE	0	\N	\N	\N	\N	\N	\N	\N	\N	2026-07-01 04:59:25.335216+00	2026-07-01 05:21:07.778+00
1	admin	admin@sahucsc.in	9876543210	SAHU Admin	$2b$12$v/pVzaAR2P2U89lptR6hcOaf0nBMfcck9grHq7GjnHYfsL4vxJnke	admin	t	ACTIVE	0	\N	\N	\N	\N	\N	88b2a5de-6643-4051-ad06-1dbc103a2bf4	\N	\N	2026-07-01 04:59:24.795333+00	2026-07-01 05:24:24.735+00
\.


--
-- Name: aeps_daily_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aeps_daily_id_seq', 1, true);


--
-- Name: aeps_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aeps_transactions_id_seq', 1, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 16, true);


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 1, true);


--
-- Name: broadcast_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.broadcast_logs_id_seq', 1, false);


--
-- Name: email_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_otps_id_seq', 1, false);


--
-- Name: ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ledger_id_seq', 2, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 6, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 1, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 22, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 15, true);


--
-- Name: udhari_customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udhari_customers_id_seq', 1, false);


--
-- Name: udhari_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.udhari_entries_id_seq', 1, false);


--
-- Name: user_notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_notification_preferences_id_seq', 1, false);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_preferences_id_seq', 1, true);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: aeps_daily aeps_daily_date_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aeps_daily
    ADD CONSTRAINT aeps_daily_date_user UNIQUE (date, created_by);


--
-- Name: aeps_daily aeps_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aeps_daily
    ADD CONSTRAINT aeps_daily_pkey PRIMARY KEY (id);


--
-- Name: aeps_transactions aeps_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aeps_transactions
    ADD CONSTRAINT aeps_transactions_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: backups backups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_pkey PRIMARY KEY (id);


--
-- Name: broadcast_logs broadcast_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broadcast_logs
    ADD CONSTRAINT broadcast_logs_pkey PRIMARY KEY (id);


--
-- Name: email_otps email_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_otps
    ADD CONSTRAINT email_otps_pkey PRIMARY KEY (id);


--
-- Name: email_otps email_otps_verified_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_otps
    ADD CONSTRAINT email_otps_verified_token_unique UNIQUE (verified_token);


--
-- Name: ledger ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger
    ADD CONSTRAINT ledger_pkey PRIMARY KEY (id);


--
-- Name: ledger ledger_receipt_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger
    ADD CONSTRAINT ledger_receipt_number_unique UNIQUE (receipt_number);


--
-- Name: ledger ledger_receipt_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger
    ADD CONSTRAINT ledger_receipt_token_unique UNIQUE (receipt_token);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_unique UNIQUE (token);


--
-- Name: push_subscriptions push_subscriptions_endpoint_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: receipt_counters receipt_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_counters
    ADD CONSTRAINT receipt_counters_pkey PRIMARY KEY (year);


--
-- Name: services services_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_name_unique UNIQUE (name);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_unique UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: udhari_customers udhari_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udhari_customers
    ADD CONSTRAINT udhari_customers_pkey PRIMARY KEY (id);


--
-- Name: udhari_entries udhari_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udhari_entries
    ADD CONSTRAINT udhari_entries_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_unique UNIQUE (user_id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_session_id_unique UNIQUE (session_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_user_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_action ON public.audit_logs USING btree (user_id, action);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_broadcast_logs_channel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_broadcast_logs_channel ON public.broadcast_logs USING btree (channel);


--
-- Name: idx_broadcast_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_broadcast_logs_created_at ON public.broadcast_logs USING btree (created_at);


--
-- Name: idx_broadcast_logs_sent_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_broadcast_logs_sent_by ON public.broadcast_logs USING btree (sent_by);


--
-- Name: idx_ledger_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ledger_created_by ON public.ledger USING btree (created_by);


--
-- Name: idx_ledger_created_by_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ledger_created_by_date ON public.ledger USING btree (created_by, date);


--
-- Name: idx_ledger_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ledger_date ON public.ledger USING btree (date);


--
-- Name: idx_ledger_service_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ledger_service_type ON public.ledger USING btree (service_type);


--
-- Name: idx_notif_prefs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_prefs_user_id ON public.user_notification_preferences USING btree (user_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_udhari_customers_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_udhari_customers_created_by ON public.udhari_customers USING btree (created_by);


--
-- Name: idx_udhari_customers_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_udhari_customers_mobile ON public.udhari_customers USING btree (mobile);


--
-- Name: idx_udhari_entries_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_udhari_entries_created_by ON public.udhari_entries USING btree (created_by);


--
-- Name: idx_udhari_entries_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_udhari_entries_customer_id ON public.udhari_entries USING btree (customer_id);


--
-- Name: idx_udhari_entries_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_udhari_entries_date ON public.udhari_entries USING btree (date);


--
-- Name: idx_user_sessions_active_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_active_expires ON public.user_sessions USING btree (is_active, expires_at);


--
-- Name: idx_user_sessions_user_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_active ON public.user_sessions USING btree (user_id, is_active);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: aeps_transactions aeps_transactions_daily_id_aeps_daily_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aeps_transactions
    ADD CONSTRAINT aeps_transactions_daily_id_aeps_daily_id_fk FOREIGN KEY (daily_id) REFERENCES public.aeps_daily(id) ON DELETE CASCADE;


--
-- Name: udhari_customers udhari_customers_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udhari_customers
    ADD CONSTRAINT udhari_customers_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: udhari_entries udhari_entries_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udhari_entries
    ADD CONSTRAINT udhari_entries_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: udhari_entries udhari_entries_customer_id_udhari_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.udhari_entries
    ADD CONSTRAINT udhari_entries_customer_id_udhari_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.udhari_customers(id) ON DELETE CASCADE;


--
-- Name: user_notification_preferences user_notification_preferences_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict cpkJiDWxPHFy1kZCxqjBVXiIZFV5HHSf8cWxab1i9MY5Q0MQU6KBTxMGnjymOCC

