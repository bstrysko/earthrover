#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <getopt.h>
#include <string.h>
#include <sys/time.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <assert.h>
#include <syslog.h>
#include <signal.h>

#include <libwebsockets.h>
#include <wiringPi.h>
#include <softPwm.h>

static int close_testing;
int max_poll_elements;

struct pollfd *pollfds;
int *fd_lookup;
int count_pollfds;
int force_exit = 0;

#define LEFT_MOTOR_FORWARD 0
#define LEFT_MOTOR_BACKWARD 3

#define RIGHT_MOTOR_FORWARD 1
#define RIGHT_MOTOR_BACKWARD 4

void leftMotor(int value);
void rightMotor(int value);

void straight(int value);

void init_pins()
{
	if(wiringPiSetup() == -1)
	{
		printf("Could not initialize WiringPI");
		exit(1);
	}

	/*
	 * Set motor pins to outputs
	 */
	/*
	 * Left Motors
	 */
	softPwmCreate(LEFT_MOTOR_FORWARD,0,100);
	softPwmCreate(LEFT_MOTOR_BACKWARD,0,100);


	/*
	 * Right Motors
	 */
	softPwmCreate(RIGHT_MOTOR_FORWARD,0,100);
	softPwmCreate(RIGHT_MOTOR_BACKWARD,0,100);

	/*
	 * Make motor pins low on start
	 */
	leftMotor(0);
	rightMotor(0);
}

void leftMotor(int value)
{
	int forward_value = 0;
	int backward_value = 0;
	
	if(value > 0)
	{
		forward_value = value;
	}
	else if(value < 0)
	{
		backward_value = -value;
	}

	softPwmWrite(LEFT_MOTOR_FORWARD,forward_value);
	softPwmWrite(LEFT_MOTOR_BACKWARD,backward_value);
}

void rightMotor(int value)
{
	int forward_value = 0;
	int backward_value = 0;
	
	if(value > 0)
	{
		forward_value = value;
	}
	else if(value < 0)
	{
		backward_value = -value;
	}

	softPwmWrite(RIGHT_MOTOR_FORWARD,forward_value);
	softPwmWrite(RIGHT_MOTOR_BACKWARD,backward_value);
}



/*
 * This demo server shows how to use libwebsockets for one or more
 * websocket protocols in the same server
 *
 * It defines the following websocket protocols:
 *
 *  dumb-increment-protocol:  once the socket is opened, an incrementing
 *				ascii string is sent down it every 50ms.
 *				If you send "reset\n" on the websocket, then
 *				the incrementing number is reset to 0.
 */

enum demo_protocols {
	/* always first */
	PROTOCOL_HTTP = 0,

	PROTOCOL_DUMB_INCREMENT,

	/* always last */
	DEMO_PROTOCOL_COUNT
};



/*
 * We take a strict whitelist approach to stop ../ attacks
 */

struct serveable {
	const char *urlpath;
	const char *mimetype;
}; 

struct per_session_data__http {
	int fd;
};

/* this protocol server (always the first one) just knows how to do HTTP */

static int callback_http(struct libwebsocket_context *context,
		struct libwebsocket *wsi,
		enum libwebsocket_callback_reasons reason, void *user,
							   void *in, size_t len)
{
	char buf[256];
	int n, m;
	unsigned char *p;
	static unsigned char buffer[4096];
	struct stat stat_buf;
	struct per_session_data__http *pss = (struct per_session_data__http *)user;

	switch (reason) 
	{
		case LWS_CALLBACK_HTTP:
		{
			if(strcmp((char*)in,"/") == 0)
			{
				strcat((char*)in,"index.html");
			}

			/*
		 	 * Determine mime type
		 	 */
			char *extension = strrchr((char*)in, '.');
			char *mime;
                  
			// choose mime type based on the file extension
			if(extension == NULL) 
			{
                        	mime = "text/plain";
                    	} 
			else if(strcmp(extension, ".png") == 0) 
			{
                        	mime = "image/png";
			} 
			else if(strcmp(extension, ".jpg") == 0) 
			{
                        	mime = "image/jpg";
			} 
			else if(strcmp(extension, ".gif") == 0) 
			{
                        	mime = "image/gif";
			} 
			else if(strcmp(extension, ".html") == 0) 
			{
				mime = "text/html";
                    	} 
			else if(strcmp(extension, ".css") == 0)
			{
				mime = "text/css";
			}
			else if(strcmp(extension,".js") == 0)
			{
				mime = "application/javascript";
			}
			else
			{
				mime = "text/plain";
			}

			char buffer[256];
			strcpy(buffer,"public");
			strcat(buffer,(char*)in);

			if(libwebsockets_serve_http_file(context, wsi, buffer, mime))
			{
				return -1; /* through completion or error, close the socket */
			}
			
			break;
		}

	case LWS_CALLBACK_HTTP_FILE_COMPLETION:
		/* kill the connection after we sent one file */
		return -1;

bail:
		close(pss->fd);
		return -1;

	/*
	 * callback for confirming to continue with client IP appear in
	 * protocol 0 callback since no websocket protocol has been agreed
	 * yet.  You can just ignore this if you won't filter on client IP
	 * since the default uhandled callback return is 0 meaning let the
	 * connection continue.
	 */

	case LWS_CALLBACK_FILTER_NETWORK_CONNECTION:
#if 0
		libwebsockets_get_peer_addresses(context, wsi, (int)(long)in, client_name,
			     sizeof(client_name), client_ip, sizeof(client_ip));

		fprintf(stderr, "Received network connect from %s (%s)\n",
							client_name, client_ip);
#endif
		/* if we returned non-zero from here, we kill the connection */
		break;

	default:
		break;
	}

	return 0;
}

/*
 * this is just an example of parsing handshake headers, you don't need this
 * in your code unless you will filter allowing connections by the header
 * content
 */

static void dump_handshake_info(struct libwebsocket *wsi)
{
	int n;
	static const char *token_names[WSI_TOKEN_COUNT] = {
		/*[WSI_TOKEN_GET_URI]		=*/ "GET URI",
		/*[WSI_TOKEN_HOST]		=*/ "Host",
		/*[WSI_TOKEN_CONNECTION]	=*/ "Connection",
		/*[WSI_TOKEN_KEY1]		=*/ "key 1",
		/*[WSI_TOKEN_KEY2]		=*/ "key 2",
		/*[WSI_TOKEN_PROTOCOL]		=*/ "Protocol",
		/*[WSI_TOKEN_UPGRADE]		=*/ "Upgrade",
		/*[WSI_TOKEN_ORIGIN]		=*/ "Origin",
		/*[WSI_TOKEN_DRAFT]		=*/ "Draft",
		/*[WSI_TOKEN_CHALLENGE]		=*/ "Challenge",

		/* new for 04 */
		/*[WSI_TOKEN_KEY]		=*/ "Key",
		/*[WSI_TOKEN_VERSION]		=*/ "Version",
		/*[WSI_TOKEN_SWORIGIN]		=*/ "Sworigin",

		/* new for 05 */
		/*[WSI_TOKEN_EXTENSIONS]	=*/ "Extensions",

		/* client receives these */
		/*[WSI_TOKEN_ACCEPT]		=*/ "Accept",
		/*[WSI_TOKEN_NONCE]		=*/ "Nonce",
		/*[WSI_TOKEN_HTTP]		=*/ "Http",
		/*[WSI_TOKEN_MUXURL]	=*/ "MuxURL",
	};
	char buf[256];

	for (n = 0; n < WSI_TOKEN_COUNT; n++) {
		if (!lws_hdr_total_length(wsi, n))
			continue;

		lws_hdr_copy(wsi, buf, sizeof buf, n);

		fprintf(stderr, "    %s = %s\n", token_names[n], buf);
	}
}

static int callback_earthrover(struct libwebsocket_context *context, struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason, void *user, void *in, size_t len)
{
	int n, m;
	
	switch (reason) 
	{
		case LWS_CALLBACK_ESTABLISHED:
		{
			char name[256];
			char ip[256];

			int fd = libwebsocket_get_socket_fd(wsi);
			libwebsockets_get_peer_addresses(context,wsi,fd,name,256,ip,256);

			printf("Websocket Client Connected %s (%s) \n",name,ip);
			break;
		}
		case LWS_CALLBACK_SERVER_WRITEABLE:
		{
			break;
		}
		case LWS_CALLBACK_RECEIVE:
		{
			double x1,y1,x2,y2;
			sscanf((char*)in,"%lf:%lf:%lf:%lf",&x1,&y1,&x2,&y2);

			if(abs(y1) < 0.05)
			{
				y1 = 0;
			}

			if(abs(y2) < 0.05)
			{
				y2 = 0;
			}

			leftMotor((int)(-y1*100));
			rightMotor((int)(-y2*100));

			printf("%lf,%lf,%lf,%lf\n",x1,y1,x2,y2);
			break;
		}
		default:
		{
			break;
		}
	}

	return 0;
}

/* list of supported protocols and callbacks */

static struct libwebsocket_protocols protocols[] = {
	/* first protocol must always be HTTP handler */

	{
		"http-only",		/* name */
		callback_http,		/* callback */
		sizeof (struct per_session_data__http),	/* per_session_data_size */
		0,			/* max frame size / rx buffer */
	},
	{
		"earthrover",
		callback_earthrover,
		0,
		0,
	},
	{ NULL, NULL, 0, 0 } /* terminator */
};

void sighandler(int sig)
{
	leftMotor(0);
	rightMotor(0);
	force_exit = 1;
}

static struct option options[] = {
	{ "help",	no_argument,		NULL, 'h' },
	{ "debug",	required_argument,	NULL, 'd' },
	{ "port",	required_argument,	NULL, 'p' },
	{ "interface",  required_argument,	NULL, 'i' },
	{ "closetest",  no_argument,		NULL, 'c' },
	{ "daemonize", 	no_argument,		NULL, 'D' },
	{ NULL, 0, 0, 0 }
};

int main(int argc, char **argv)
{
	char cert_path[1024];
	char key_path[1024];
	int n = 0;
	struct libwebsocket_context *context;
	int opts = 0;
	char interface_name[128] = "";
	const char *iface = NULL;
	int syslog_options = LOG_PID | LOG_PERROR;
	unsigned int oldus = 0;
	struct lws_context_creation_info info;

	int debug_level = 7;
	int daemonize = 0;

	memset(&info, 0, sizeof info);
	info.port = 7681;

	while (n >= 0) {
		n = getopt_long(argc, argv, "ci:hsp:d:Dr:", options, NULL);
		if (n < 0)
			continue;
		switch (n) {
		case 'D':
			daemonize = 1;
			syslog_options &= ~LOG_PERROR;
			break;
		case 'd':
			debug_level = atoi(optarg);
			break;
		case 'p':
			info.port = atoi(optarg);
			break;
		case 'i':
			strncpy(interface_name, optarg, sizeof interface_name);
			interface_name[(sizeof interface_name) - 1] = '\0';
			iface = interface_name;
			break;
		case 'c':
			close_testing = 1;
			fprintf(stderr, " Close testing mode -- closes on "
					   "client after 50 dumb increments"
					   "and suppresses lws_mirror spam\n");
			break;
		case 'h':
			fprintf(stderr, "Usage: test-server "
					"[--port=<p>] "
					"[-d <log bitfield>] "
					"[--resource_path <path>]\n");
			exit(1);
		}
	}

	init_pins();

	/* 
	 * normally lock path would be /var/lock/lwsts or similar, to
	 *tarted without having to take care about
	 * permissions or running as root, set to /tmp/.lwsts-lock
	 */
	if (daemonize && lws_daemonize("/tmp/.lwsts-lock")) {
		fprintf(stderr, "Failed to daemonize\n");
		return 1;
	}

	signal(SIGINT, sighandler);

	/* we will only try to log things according to our debug_level */
	setlogmask(LOG_UPTO (LOG_DEBUG));
	openlog("lwsts", syslog_options, LOG_DAEMON);

	/* tell the library what debug level to emit and to send it to syslog */
	lws_set_log_level(debug_level, lwsl_emit_syslog);

	info.iface = iface;
	info.protocols = protocols;
#ifndef LWS_NO_EXTENSIONS
	info.extensions = libwebsocket_get_internal_extensions();
#endif
	info.ssl_cert_filepath = NULL;
	info.ssl_private_key_filepath = NULL;
	
	info.gid = -1;
	info.uid = -1;
	info.options = opts;

	context = libwebsocket_create_context(&info);
	if (context == NULL) {
		lwsl_err("libwebsocket init failed\n");
		return -1;
	}

	n = 0;
	while (n >= 0 && !force_exit) {
		/*
		 * If libwebsockets sockets are all we care about,
		 * you can use this api which takes care of the poll()
		 * and looping through finding who needed service.
		 *
		 * If no socket needs service, it'll return anyway after
		 * the number of ms in the second argument.
		 */

		n = libwebsocket_service(context, 50);
	}

	libwebsocket_context_destroy(context);

	lwsl_notice("libwebsockets-test-server exited cleanly\n");

	closelog();

	return 0;
}
