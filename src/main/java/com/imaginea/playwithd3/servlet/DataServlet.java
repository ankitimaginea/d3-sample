/**
 * 
 */
package com.imaginea.playwithd3.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author sboyina
 *
 */
public class DataServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		int min = Integer.parseInt(request.getParameter("min"));
		int max = Integer.parseInt(request.getParameter("max"));
		response.getWriter().write(RandomDataGenerator.getDataSet(max - min));
	}

}
