/***************************************************************************
   Copyright 2016-2017 OSIsoft, LLC.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 ***************************************************************************/

//************************************
// Begin defining a new symbol
//************************************
(function (PV) {
	//'use strict';
	// Specify the symbol definition	
	var myCustomSymbolDefinition = {
		typeName: 'amcharts-multiradar',
		// Specify the user-friendly name of the symbol that will appear in PI Vision
		displayName: 'Multi Radar',
		// Specify the number of data sources for this symbol; just a single data source or multiple
		datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		// Specify the location of an image file to use as the icon for this symbol
		iconUrl: '/Scripts/app/editor/symbols/ext/Icons/sym-amcharts-radar.png',
		visObjectType: symbolVis,
		// Specify default configuration for this symbol
		getDefaultConfig: function () {
			return {
				DataShape: 'Table',
				Height: 300,
				Width: 400,
				minimumYValue: 0,
				maximumYValue: 100,
				useCustomYAxisRange: false,
                textColor: "white",
                backgroundColor: "transparent",
                gridColor: "gray",
                fontSize: 10,
                seriesColor: "#3e98d3",
                showChartScrollBar: true,
                fillAlphas: 0.1,
				ShowLabel: true
            };
		},
        configOptions: function () {
            return [{
				title: 'Format Symbol',
                mode: 'format'
            }];
        },
	};
	
	//************************************
	// Function called to initialize the symbol
	//************************************
	function symbolVis() { }
    PV.deriveVisualizationFromBase(symbolVis);
	symbolVis.prototype.init = function(scope, elem) {
		// Specify which function to call when a data update or configuration change occurs 
		this.onDataUpdate = myCustomDataUpdateFunction;
		this.onConfigChange = ChangeFunction;
		
		// Locate the html div that will contain the symbol, using its id, which is "container" by default
		var symbolContainerDiv = elem.find('#container')[0];
        // Use random functions to generate a new unique id for this symbol, to make it unique among all other custom symbols
		var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
		// Write that new unique ID back to overwrite the old id
        symbolContainerDiv.id = newUniqueIDString;
		// Create a variable to hold the custom visualization object
		var customVisualizationObject = false;
		// Create a variable to hold the combined data array and itemArray
		// itemArray keeps label information which is meta data but need to 
		var dataArray = [];
		var itemArray = [];
		var showlabelsetting;
        
		// Create variables to hold the old axis specifications
		var minimumYValue_old, maximumYValue_old;
		
		//************************************
		// When a data update occurs...
		//************************************
		function myCustomDataUpdateFunction(data) {
			// If there is indeed new data in the update
			if (data !== null) {
				dataArray = [];	
				var i = 0;
				for (i = 0; i < data["Rows"].length; i++) {
					if (data["Rows"][i].Label) {
						itemArray[i] = data["Rows"][i].Label
					}			
					var newDataObject = {
                        "itemLabel":  itemArray[i],
						"value": parseFloat( ( "" + data["Rows"][i].Value ).replace(",", "") ),
                        "indexNumber": i
					};
					// Add this object to the data array
					dataArray.push(newDataObject);

				}
				showlabelsetting = scope.config.ShowLabel;
				// Create the custom visualization
				MakeChart();
				ChangeFunction();
			}
		}

		//************************************
		// Function that is called when custom configuration changes are made
		//************************************
		function ChangeFunction(data) {
			// If the visualization exists...
			
			if(customVisualizationObject) {
				// scope.config.ShowLabel changing require to call MakeChart...
				if(showlabelsetting != scope.config.ShowLabel)
				{
					showlabelsetting = scope.config.ShowLabel;
					MakeChart();
				}
				// Update the minimum, max
				if (minimumYValue_old != scope.config.minimumYValue) {
					minimumYValue_old = scope.config.minimumYValue;
				}
				if (maximumYValue_old != scope.config.maximumYValue) {
					maximumYValue_old = scope.config.maximumYValue;
                }
                if (scope.config.useCustomYAxisRange) {
                    customVisualizationObject.valueAxes[0].minimum = scope.config.minimumYValue;
                    customVisualizationObject.valueAxes[0].maximum = scope.config.maximumYValue;
                }

                // Update colors and fonts
                if (customVisualizationObject.graphs[0].lineColor != scope.config.seriesColor) {
                    customVisualizationObject.graphs[0].lineColor = scope.config.seriesColor;
                }
                if (customVisualizationObject.graphs[0].fillAlphas != scope.config.fillAlphas) {
                    customVisualizationObject.graphs[0].fillAlphas = scope.config.fillAlphas;
                }                
                if (customVisualizationObject.color != scope.config.textColor) {
                    customVisualizationObject.color = scope.config.textColor;
                }
                if (customVisualizationObject.backgroundColor != scope.config.backgroundColor) {
                    customVisualizationObject.backgroundColor = scope.config.backgroundColor;
                }
                if (customVisualizationObject.valueAxes[0].gridColor != scope.config.gridColor) {
                    customVisualizationObject.valueAxes[0].gridColor = scope.config.gridColor;
					customVisualizationObject.valueAxes[0].axisColor = scope.config.gridColor;
                }
                if (customVisualizationObject.fontSize != scope.config.fontSize) {
                    customVisualizationObject.fontSize = scope.config.fontSize;
                }
				// Commit updates to the chart
				customVisualizationObject.validateNow();
			}
		}
		function MakeChart() {		
			customVisualizationObject = AmCharts.makeChart(symbolContainerDiv.id, {
				"type": "radar",
				"backgroundAlpha": 1,
				"backgroundColor": scope.config.backgroundColor,
				"color": scope.config.textColor,
				"plotAreaFillAlphas": 1,
				"plotAreaFillColors": scope.config.plotAreaFillColor,
				"fontFamily": "arial",
				"creditsPosition": "bottom-right",
				"fontSize": 10,
				"valueAxes": [{
					"axisAlpha": 0.2,
					"axisColor": scope.config.gridColor,
					"gridAlpha": 0.2,
					"gridColor": scope.config.gridColor,
					"gridType": "circles",
					"integersOnly": "false",
					"autoGridCount": false,
					"fillAlpha":0.05
				}],
				"categoryAxis": {
					"categoryFunction": function (valueText, dataItem, categoryAxis) {
						// Specify the max number of labels that should be shown
						var maxNumberOfLabels = 100;
						var labelDivisor = Math.ceil(dataArray.length / maxNumberOfLabels);
						if (labelDivisor == 0) {
							labelDivisor = 1;
						}                                
						// Only return every nth label, using the divisor calculated above
						if (dataItem.indexNumber % labelDivisor == 0 && scope.config.ShowLabel == true) {
							return dataItem.itemLabel;
						} 
						else{
							return "";
						}
					}
				},                     
				"graphs": [{
					"fillAlphas": scope.config.fillAlphas,
					"lineColor": scope.config.seriesColor,
					"valueField": "value",
					"bullet": "round",
					"bulletAlpha": 0
				}],
				"balloon": {
						"color": "white",
						"borderColor":"white",
						"fillColor": "#303030"
				},
				"dataProvider": dataArray,
				"categoryField": "timestampString",
			});
		}	
	}
	// Register this custom symbol definition with PI Vision
	PV.symbolCatalog.register(myCustomSymbolDefinition);	
})(window.PIVisualization);