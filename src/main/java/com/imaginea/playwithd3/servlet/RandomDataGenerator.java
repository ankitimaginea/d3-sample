/**
 * 
 */
package com.imaginea.playwithd3.servlet;

import com.google.gson.JsonArray;
import com.google.gson.JsonPrimitive;

/**
 * @author sboyina
 *
 */
public class RandomDataGenerator {

	private static final String[] US_STATES = { "Alabama", "Alaska",
			"American Samoa", "Arizona", "Arkansas", "California", "Colorado",
			"Connecticut", "Delaware", "Dist. of Columbia", "Florida",
			"Georgia", "Guam", "Hawaii", "Idaho", "Illinois", "Indiana",
			"Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
			"Marshall Islands", "Massachusetts", "Michigan", "Micronesia",
			"Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
			"Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
			"North Carolina", "North Dakota", "Northern Marianas", "Ohio",
			"Oklahoma", "Oregon", "Palau", "Pennsylvania", "Puerto Rico",
			"Rhode Island", "South Carolina", "South Dakota", "Tennessee",
			"Texas", "Utah", "Vermont", "Virginia", "Virgin Islands",
			"Washington", "West Virginia", "Wisconsin", "Wyoming" };

	private static final int MAX_VALUE = 1000;

	public static final String getDataSet(int noOfDataPoints) {
		JsonArray dataSet = new JsonArray();
		for (int i = 0; i <= noOfDataPoints; i++) {
			JsonArray dataPoint = new JsonArray();
			for (String state : US_STATES) {
				JsonArray statePoint = new JsonArray();
				statePoint.add(new JsonPrimitive(getRandom(MAX_VALUE)));
				statePoint.add(new JsonPrimitive(state));
				dataPoint.add(statePoint);
			}
			dataSet.add(dataPoint);
		}
		return dataSet.toString();
	}

	private static final long getRandom(int max) {
		return new Double(Math.ceil(Math.random() * max)).longValue();
	}
}
