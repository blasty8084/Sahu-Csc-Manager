--
-- PostgreSQL database dump
--

\restrict gixLC4bzG0FYIPxpqXRhnaslYebDmqEIHi6V7Q0ofUIvmW3IBCT2h8kMzkUdkTS

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
\.


--
-- Data for Name: aeps_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aeps_transactions (id, daily_id, type, amount, customer_name, description, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, details, ip_address, created_at) FROM stdin;
1	1	login	Logged in from Chrome on Android	49.42.227.27	2026-06-16 05:49:08.205275+00
2	1	logout	User logged out	49.42.226.134	2026-06-16 06:39:45.694687+00
3	1	login.failed_password	Wrong password attempt 1/5 from Chrome on Linux	49.42.226.134	2026-06-16 06:40:15.054242+00
4	1	login	Logged in from Chrome on Linux	49.42.226.134	2026-06-16 06:40:26.655791+00
5	1	ledger.clear	Deleted ALL ledger transactions	49.42.226.134	2026-06-16 06:40:38.089346+00
6	1	settings.update	Updated system settings	49.42.226.134	2026-06-16 06:40:54.998936+00
7	1	settings.update	Updated system settings	49.42.226.134	2026-06-16 06:40:57.425018+00
8	1	REGISTRATION_ENABLED	Registration enabled by admin	49.42.226.134	2026-06-16 06:42:05.350077+00
9	1	logout	User logged out	49.42.226.134	2026-06-16 06:42:18.211618+00
10	7	REGISTER_REQUEST	New registration submitted: Xyz	49.42.226.134	2026-06-16 06:43:08.154951+00
11	1	login	Logged in from Chrome on Android	49.42.226.134	2026-06-16 06:43:56.252742+00
12	1	logout	User logged out	49.42.226.134	2026-06-16 06:44:22.765383+00
13	7	login.failed_inactive	Login blocked — account pending approval from Chrome on Linux	49.42.226.134	2026-06-16 06:44:28.86371+00
14	7	login.failed_inactive	Login blocked — account pending approval from Chrome on Android	49.42.226.134	2026-06-16 06:44:46.579768+00
15	1	login	Logged in from Chrome on Android	49.42.226.134	2026-06-16 06:56:17.644325+00
16	1	APPROVED	Approved user: Xyz	49.42.226.134	2026-06-16 06:57:18.893471+00
17	1	user.delete	Deleted user 7	49.42.226.134	2026-06-16 06:58:06.88165+00
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backups (id, filename, size, created_at) FROM stdin;
\.


--
-- Data for Name: ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ledger (id, date, customer_name, service_type, credit, debit, description, balance, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, priority, is_read, read_at, link, meta, created_at) FROM stdin;
1	\N	Welcome to SAHU CSC!	Your Common Service Center management platform is ready. Start by adding ledger entries.	success	MEDIUM	f	\N	\N	\N	2026-06-16 05:27:02.839457+00
2	\N	Welcome to SAHU CSC!	Your Common Service Center management platform is ready. Start by adding ledger entries.	success	MEDIUM	f	\N	\N	\N	2026-06-16 05:40:54.575303+00
3	1	Login Successful	You logged in from Chrome on Android (49.42.227.27).	security	MEDIUM	f	\N	\N	{"ip": "49.42.227.27", "device": "Chrome on Android"}	2026-06-16 05:49:08.219644+00
4	\N	Welcome to SAHU CSC!	Your Common Service Center management platform is ready. Start by adding ledger entries.	success	MEDIUM	f	\N	\N	\N	2026-06-16 06:20:33.199676+00
5	1	Failed Login Attempt	Failed password attempt 1/5 from Chrome on Linux (49.42.226.134).	security	HIGH	f	\N	\N	{"ip": "49.42.226.134", "device": "Chrome on Linux", "attemptCount": 1}	2026-06-16 06:40:15.062199+00
6	1	Login Successful	You logged in from Chrome on Linux (49.42.226.134).	security	MEDIUM	f	\N	\N	{"ip": "49.42.226.134", "device": "Chrome on Linux"}	2026-06-16 06:40:26.663356+00
7	\N	Registration Setting Changed	Public registration has been enabled by admin.	info	MEDIUM	f	\N	\N	\N	2026-06-16 06:42:05.353976+00
8	\N	New Registration Request	Xyz submitted a registration request — pending approval	info	MEDIUM	f	\N	/users	\N	2026-06-16 06:43:08.159989+00
9	\N	Failed Login Attempt	Failed login for: Xyx	warning	MEDIUM	f	\N	\N	\N	2026-06-16 06:43:24.173963+00
10	1	Login Successful	You logged in from Chrome on Android (49.42.226.134).	security	MEDIUM	f	\N	\N	{"ip": "49.42.226.134", "device": "Chrome on Android"}	2026-06-16 06:43:56.263554+00
11	1	Login Successful	You logged in from Chrome on Android (49.42.226.134).	security	MEDIUM	f	\N	\N	{"ip": "49.42.226.134", "device": "Chrome on Android"}	2026-06-16 06:56:17.700901+00
12	\N	User Approved	Xyz's account has been approved.	success	MEDIUM	f	\N	\N	\N	2026-06-16 06:57:18.898149+00
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
1	1	https://fcm.googleapis.com/fcm/send/dp4TEiSE84U:APA91bFdG5Vv-R2yQvpREff_7JBU_HnO-R_-1SC6ndwacyU8B1sR-DDcNFykBFI4ar8e7y9XKRVTSVvNTdjCXohRknIdb0abcE0JYebQQdE2H_Y8dWDleui2zqkBhvAq5UPijoHQ7Igp	BG6aZk-WgYKAMf7H4Ec85TVNxn29QNgVZd0NcMzFhVUzGnxHc1xEhskF1YN9iq1WyhRtFBH1TIp43PBPmjr6ZXU	lIruWozgnwOdgAwwyKe5Vw	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	2026-06-16 06:57:57.880821
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, description, price, category, is_active, created_at, updated_at) FROM stdin;
1	PAN Card	PAN card application and correction	107.00	Government ID	t	2026-06-16 05:27:02.356805+00	2026-06-16 05:27:02.356805+00
2	Aadhaar Update	Aadhaar card update and correction	50.00	Government ID	t	2026-06-16 05:27:02.361621+00	2026-06-16 05:27:02.361621+00
3	Voter ID	Voter ID card enrollment and correction	0.00	Government ID	t	2026-06-16 05:27:02.365275+00	2026-06-16 05:27:02.365275+00
4	Passport Application	Passport application assistance	500.00	Government ID	t	2026-06-16 05:27:02.369555+00	2026-06-16 05:27:02.369555+00
5	Driving License	DL application and renewal	300.00	Government ID	t	2026-06-16 05:27:02.372996+00	2026-06-16 05:27:02.372996+00
6	Income Certificate	Income certificate from state govt	30.00	Certificates	t	2026-06-16 05:27:02.377229+00	2026-06-16 05:27:02.377229+00
7	Caste Certificate	Caste certificate application	30.00	Certificates	t	2026-06-16 05:27:02.380837+00	2026-06-16 05:27:02.380837+00
8	Residence Certificate	Residence proof certificate	30.00	Certificates	t	2026-06-16 05:27:02.384453+00	2026-06-16 05:27:02.384453+00
9	Birth Certificate	Birth certificate correction/copy	50.00	Certificates	t	2026-06-16 05:27:02.387757+00	2026-06-16 05:27:02.387757+00
10	Insurance Premium	Life / health insurance premium payment	20.00	Insurance & Finance	t	2026-06-16 05:27:02.391277+00	2026-06-16 05:27:02.391277+00
11	Loan Application	Bank loan application assistance	200.00	Insurance & Finance	t	2026-06-16 05:27:02.395539+00	2026-06-16 05:27:02.395539+00
12	Bank Account Opening	Zero-balance savings account	0.00	Insurance & Finance	t	2026-06-16 05:27:02.400712+00	2026-06-16 05:27:02.400712+00
13	Electricity Bill	Electricity bill payment	10.00	Utility Bills	t	2026-06-16 05:27:02.403828+00	2026-06-16 05:27:02.403828+00
14	Water Bill	Water supply bill payment	10.00	Utility Bills	t	2026-06-16 05:27:02.40708+00	2026-06-16 05:27:02.40708+00
15	Mobile Recharge	Prepaid mobile recharge	5.00	Utility Bills	t	2026-06-16 05:27:02.410067+00	2026-06-16 05:27:02.410067+00
16	DTH Recharge	DTH / cable TV recharge	10.00	Utility Bills	t	2026-06-16 05:27:02.413243+00	2026-06-16 05:27:02.413243+00
17	PMKVY Enrollment	Skill training enrollment	0.00	Government Schemes	t	2026-06-16 05:27:02.416376+00	2026-06-16 05:27:02.416376+00
18	PM Kisan	PM Kisan beneficiary registration	0.00	Government Schemes	t	2026-06-16 05:27:02.423564+00	2026-06-16 05:27:02.423564+00
19	Ayushman Bharat	Health card registration	30.00	Government Schemes	t	2026-06-16 05:27:02.428929+00	2026-06-16 05:27:02.428929+00
20	Photo Print	Passport size photo printing	30.00	Other Services	t	2026-06-16 05:27:02.432301+00	2026-06-16 05:27:02.432301+00
21	Photocopy	Document photocopying	2.00	Other Services	t	2026-06-16 05:27:02.434895+00	2026-06-16 05:27:02.434895+00
22	Scanning	Document scanning	10.00	Other Services	t	2026-06-16 05:27:02.439092+00	2026-06-16 05:27:02.439092+00
23	PAN Card	PAN card application and correction	107.00	Government ID	t	2026-06-16 05:40:54.470935+00	2026-06-16 05:40:54.470935+00
24	Aadhaar Update	Aadhaar card update and correction	50.00	Government ID	t	2026-06-16 05:40:54.477963+00	2026-06-16 05:40:54.477963+00
25	Voter ID	Voter ID card enrollment and correction	0.00	Government ID	t	2026-06-16 05:40:54.482481+00	2026-06-16 05:40:54.482481+00
26	Passport Application	Passport application assistance	500.00	Government ID	t	2026-06-16 05:40:54.487749+00	2026-06-16 05:40:54.487749+00
27	Driving License	DL application and renewal	300.00	Government ID	t	2026-06-16 05:40:54.496639+00	2026-06-16 05:40:54.496639+00
28	Income Certificate	Income certificate from state govt	30.00	Certificates	t	2026-06-16 05:40:54.500232+00	2026-06-16 05:40:54.500232+00
29	Caste Certificate	Caste certificate application	30.00	Certificates	t	2026-06-16 05:40:54.504097+00	2026-06-16 05:40:54.504097+00
30	Residence Certificate	Residence proof certificate	30.00	Certificates	t	2026-06-16 05:40:54.510104+00	2026-06-16 05:40:54.510104+00
31	Birth Certificate	Birth certificate correction/copy	50.00	Certificates	t	2026-06-16 05:40:54.512624+00	2026-06-16 05:40:54.512624+00
32	Insurance Premium	Life / health insurance premium payment	20.00	Insurance & Finance	t	2026-06-16 05:40:54.516382+00	2026-06-16 05:40:54.516382+00
33	Loan Application	Bank loan application assistance	200.00	Insurance & Finance	t	2026-06-16 05:40:54.519062+00	2026-06-16 05:40:54.519062+00
34	Bank Account Opening	Zero-balance savings account	0.00	Insurance & Finance	t	2026-06-16 05:40:54.52156+00	2026-06-16 05:40:54.52156+00
35	Electricity Bill	Electricity bill payment	10.00	Utility Bills	t	2026-06-16 05:40:54.52608+00	2026-06-16 05:40:54.52608+00
36	Water Bill	Water supply bill payment	10.00	Utility Bills	t	2026-06-16 05:40:54.528895+00	2026-06-16 05:40:54.528895+00
37	Mobile Recharge	Prepaid mobile recharge	5.00	Utility Bills	t	2026-06-16 05:40:54.53206+00	2026-06-16 05:40:54.53206+00
38	DTH Recharge	DTH / cable TV recharge	10.00	Utility Bills	t	2026-06-16 05:40:54.534634+00	2026-06-16 05:40:54.534634+00
39	PMKVY Enrollment	Skill training enrollment	0.00	Government Schemes	t	2026-06-16 05:40:54.536999+00	2026-06-16 05:40:54.536999+00
40	PM Kisan	PM Kisan beneficiary registration	0.00	Government Schemes	t	2026-06-16 05:40:54.539786+00	2026-06-16 05:40:54.539786+00
41	Ayushman Bharat	Health card registration	30.00	Government Schemes	t	2026-06-16 05:40:54.542131+00	2026-06-16 05:40:54.542131+00
42	Photo Print	Passport size photo printing	30.00	Other Services	t	2026-06-16 05:40:54.544743+00	2026-06-16 05:40:54.544743+00
43	Photocopy	Document photocopying	2.00	Other Services	t	2026-06-16 05:40:54.547499+00	2026-06-16 05:40:54.547499+00
44	Scanning	Document scanning	10.00	Other Services	t	2026-06-16 05:40:54.554447+00	2026-06-16 05:40:54.554447+00
45	PAN Card	PAN card application and correction	107.00	Government ID	t	2026-06-16 06:20:33.09166+00	2026-06-16 06:20:33.09166+00
46	Aadhaar Update	Aadhaar card update and correction	50.00	Government ID	t	2026-06-16 06:20:33.104269+00	2026-06-16 06:20:33.104269+00
47	Voter ID	Voter ID card enrollment and correction	0.00	Government ID	t	2026-06-16 06:20:33.108525+00	2026-06-16 06:20:33.108525+00
48	Passport Application	Passport application assistance	500.00	Government ID	t	2026-06-16 06:20:33.114204+00	2026-06-16 06:20:33.114204+00
49	Driving License	DL application and renewal	300.00	Government ID	t	2026-06-16 06:20:33.116666+00	2026-06-16 06:20:33.116666+00
50	Income Certificate	Income certificate from state govt	30.00	Certificates	t	2026-06-16 06:20:33.119304+00	2026-06-16 06:20:33.119304+00
51	Caste Certificate	Caste certificate application	30.00	Certificates	t	2026-06-16 06:20:33.122429+00	2026-06-16 06:20:33.122429+00
52	Residence Certificate	Residence proof certificate	30.00	Certificates	t	2026-06-16 06:20:33.126785+00	2026-06-16 06:20:33.126785+00
53	Birth Certificate	Birth certificate correction/copy	50.00	Certificates	t	2026-06-16 06:20:33.12976+00	2026-06-16 06:20:33.12976+00
54	Insurance Premium	Life / health insurance premium payment	20.00	Insurance & Finance	t	2026-06-16 06:20:33.132162+00	2026-06-16 06:20:33.132162+00
55	Loan Application	Bank loan application assistance	200.00	Insurance & Finance	t	2026-06-16 06:20:33.137055+00	2026-06-16 06:20:33.137055+00
56	Bank Account Opening	Zero-balance savings account	0.00	Insurance & Finance	t	2026-06-16 06:20:33.141504+00	2026-06-16 06:20:33.141504+00
57	Electricity Bill	Electricity bill payment	10.00	Utility Bills	t	2026-06-16 06:20:33.146098+00	2026-06-16 06:20:33.146098+00
58	Water Bill	Water supply bill payment	10.00	Utility Bills	t	2026-06-16 06:20:33.148961+00	2026-06-16 06:20:33.148961+00
59	Mobile Recharge	Prepaid mobile recharge	5.00	Utility Bills	t	2026-06-16 06:20:33.152686+00	2026-06-16 06:20:33.152686+00
60	DTH Recharge	DTH / cable TV recharge	10.00	Utility Bills	t	2026-06-16 06:20:33.156458+00	2026-06-16 06:20:33.156458+00
61	PMKVY Enrollment	Skill training enrollment	0.00	Government Schemes	t	2026-06-16 06:20:33.158755+00	2026-06-16 06:20:33.158755+00
62	PM Kisan	PM Kisan beneficiary registration	0.00	Government Schemes	t	2026-06-16 06:20:33.161044+00	2026-06-16 06:20:33.161044+00
63	Ayushman Bharat	Health card registration	30.00	Government Schemes	t	2026-06-16 06:20:33.163354+00	2026-06-16 06:20:33.163354+00
64	Photo Print	Passport size photo printing	30.00	Other Services	t	2026-06-16 06:20:33.165994+00	2026-06-16 06:20:33.165994+00
65	Photocopy	Document photocopying	2.00	Other Services	t	2026-06-16 06:20:33.168091+00	2026-06-16 06:20:33.168091+00
66	Scanning	Document scanning	10.00	Other Services	t	2026-06-16 06:20:33.170182+00	2026-06-16 06:20:33.170182+00
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
AGmRVX94TtwFjpfWkAj_Cdo4ESgS0mt-	{"cookie":{"originalMaxAge":28800000,"expires":"2026-06-16T14:56:17.706Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1,"userRole":"admin","sessionToken":"6ef8dd7a-2735-4de2-8997-2d53603e2590","sessionId":"6ef8dd7a-2735-4de2-8997-2d53603e2590"}	2026-06-16 15:05:37
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, updated_at) FROM stdin;
1	businessName	SAHU CSC Center	2026-06-16 06:40:57.392+00
2	businessAddress	Village Road, Block HQ, Dist-XXX, Odisha - 000000	2026-06-16 06:40:57.396+00
3	businessMobile	9876543210	2026-06-16 06:40:57.4+00
4	businessEmail	admin@sahucsc.in	2026-06-16 06:40:57.403+00
5	language	en	2026-06-16 06:40:57.406+00
6	theme	light	2026-06-16 06:40:57.411+00
7	currency	INR	2026-06-16 06:40:57.414+00
8	autoBackup	true	2026-06-16 06:40:57.418+00
9	backupFrequencyDays	1	2026-06-16 06:40:57.421+00
28	registration_open	true	2026-06-16 06:42:05.309+00
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
1	1	light	en	default	2026-06-16 05:57:32.172243+00
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, session_id, device_info, browser, os, ip_address, is_active, remember_me, last_activity, expires_at, created_at) FROM stdin;
1	1	d2e652ad-d229-45ea-90d9-a7bfc3ebb5ee	Chrome on Android	Chrome	Android	49.42.227.27	f	f	2026-06-16 06:39:05.306+00	2026-06-16 13:49:07.896+00	2026-06-16 05:49:08.193689+00
2	1	a70d7b83-e746-4118-8f86-37e05543e411	Chrome on Linux	Chrome	Linux	49.42.226.134	f	f	2026-06-16 06:41:34.478+00	2026-06-16 14:40:26.62+00	2026-06-16 06:40:26.646361+00
3	1	7bc62412-ecee-4d8c-a78b-ce978bbbd4bf	Chrome on Android	Chrome	Android	49.42.226.134	f	f	2026-06-16 06:43:56.239929+00	2026-06-16 14:43:56.174+00	2026-06-16 06:43:56.239929+00
4	1	6ef8dd7a-2735-4de2-8997-2d53603e2590	Chrome on Android	Chrome	Android	49.42.226.134	t	f	2026-06-16 07:05:24.858+00	2026-06-16 14:56:17.357+00	2026-06-16 06:56:17.636764+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, mobile, full_name, password_hash, role, is_active, status, failed_login_attempts, locked_until, rejection_reason, profile_picture, bio, address, active_session_token, created_at, updated_at) FROM stdin;
2	operator	operator@sahucsc.in	9876543211	CSC Operator	$2b$12$/bpsOBQhDD3claX9TrYavOq1qKFEyMKn0oP7U/.SRjNXY5N2jfX4y	operator	t	ACTIVE	0	\N	\N	\N	\N	\N	\N	2026-06-16 05:27:02.352536+00	2026-06-16 05:27:02.352536+00
1	admin	admin@sahucsc.in	9876543210	SAHU Admin	$2b$12$7YkpwLxjDhIdd9nuRsksnesJp7ZG/dV.5fA9Wf5VSH5ahi.aOhcDO	admin	t	ACTIVE	0	\N	\N	\N	\N	\N	6ef8dd7a-2735-4de2-8997-2d53603e2590	2026-06-16 05:27:02.045636+00	2026-06-16 06:56:17.358+00
\.


--
-- Name: aeps_daily_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aeps_daily_id_seq', 1, false);


--
-- Name: aeps_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aeps_transactions_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 17, true);


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 1, false);


--
-- Name: ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ledger_id_seq', 102, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 12, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 1, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 66, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 28, true);


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

SELECT pg_catalog.setval('public.user_sessions_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


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
-- Name: ledger ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ledger
    ADD CONSTRAINT ledger_pkey PRIMARY KEY (id);


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

\unrestrict gixLC4bzG0FYIPxpqXRhnaslYebDmqEIHi6V7Q0ofUIvmW3IBCT2h8kMzkUdkTS

