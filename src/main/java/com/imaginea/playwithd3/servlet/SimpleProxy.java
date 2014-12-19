package com.imaginea.playwithd3.servlet;


import java.io.IOException;
import java.net.URI;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.http.HttpHost;
import org.apache.http.client.utils.URIUtils;
import org.mitre.dsmiley.httpproxy.ProxyServlet;

public class SimpleProxy extends ProxyServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Override
	protected void service(HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) throws ServletException,
			IOException {
		URI targetURI = null;
		String targetURL = StringEscapeUtils.unescapeHtml(servletRequest.getParameter(P_TARGET_URI));
		if (targetURL == null)
			throw new ServletException(P_TARGET_URI + " is required.");
		try {
			targetURI = new URI(targetURL);
		} catch (Exception e) {
			throw new ServletException(
					"Trying to process targetUri init parameter: " + e, e);
		}
		HttpHost targetHost = URIUtils.extractHost(targetURI);
		servletRequest.setAttribute(ATTR_TARGET_URI, targetURL);
		servletRequest.setAttribute(ATTR_TARGET_HOST, targetHost);
		super.service(servletRequest, servletResponse);
	}

	@Override
	protected String rewriteUrlFromRequest(HttpServletRequest servletRequest) {
		return StringEscapeUtils.unescapeHtml(servletRequest.getParameter(P_TARGET_URI));
	}

}