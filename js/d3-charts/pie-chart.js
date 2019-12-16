// ********** PIE CHART MODULE **********

// Exported functions at bottom of file

// Declare global variables
let svg, pieGroup, bodyGroup, legend; 

const radius = 110, 
	  innerRadius = 50, 
	  duration = 1000;

// Set margins for chart
const margin = {
	top: 30,
	left: 30,
	right: 30,
	bottom: 30
};

// Set colour function
const colors = (idx) => {
	const colorRange = ['#192a56', '#c23616'];
	return colorRange[idx];
}

// Function to parse data for Brexit figures (either by constituency, or nationally)
const genChartData = (data, constitID) => {
	if (constitID) {
		// Create array of all constituencies
		const constitArr = data[0].constituencies;
		// Prepare final data array
		let dataset = [];
		// Isolate target constituency
		const constitObj = constitArr.filter(el => el.id === constitID)[0];
		// Get constituency full name
		const constitName = constitObj.Constituency;
		// Prepare data objects
		const dataObj1 = {
			id: 'remain',
			value: constitObj.Brex.Remain,
			// If constituency, include constitName for rendering name in title in later function
			constit: constitName ? constitName : null
		};
		const dataObj2 = {
			id: 'leave',
			value: constitObj.Brex.Leave
		};
		dataset.push(dataObj1, dataObj2);
		return dataset;
	} else {
		// Target Brexit data in 'totals' array
		const brexitObj = data[1].totals[4];
		// Prepare final data array
		let dataset = [];
		// Prepare data objects
		const dataObj1 = {
			id: 'remain',
			value: brexitObj.Remain
		};
		const dataObj2 = {
			id: 'leave',
			value: brexitObj.Leave
		};
		dataset.push(dataObj1, dataObj2);
		return dataset;
	}
}

// Create SVG
const createSVG = (width, height, DOMTarget) => {
	if (!svg) {
		svg = d3.select(DOMTarget)
			.append('svg')
			.attr('height', height)
			.attr('width', width);
	}
} 

const renderLegend = (width, height, data, arc, arcMouseover) => {
	if (!legend) {
		legend = svg.append("g")
						.attr('class', 'legendGroup')
						.attr('transform', `translate(20, ${height - 65})`);
	}
	const rects = legend.selectAll('rect.legend')
						.data(data)
						.enter()
						.append('rect')
						.attr('class', 'legend')
						// activated hover on assocaited wedges
						.on('mouseover', (d, i) => {
							d3.select(`path.arc-${i}`)
								.transition()
								.attr('d', arcMouseover)
							})
			    		.on('mouseout', (d, i) => {
			    			d3.select(`path.arc-${i}`)
			    			.transition()
			    				.attr('d', arc)
			    		})
						.transition()
						.attr('x', 0)
						.attr('y', (d, i) => i * 25)
						.attr('width', 15)
						.attr('height', 15)
						.style('fill', (d, i) => {
							return colors(i)
						});

	const text = legend.selectAll('text.legend-text')
						.data(data)
						.enter()
						.append('text')
						.attr('class', 'legend-text')
						// activated hover on assocaited wedges
						.on('mouseover', (d, i) => {
							d3.select(`path.arc-${i}`)
								.transition()
								.attr('d', arcMouseover)
							})
			    		.on('mouseout', (d, i) => {
			    			// Indexing the class name to ease selection from other parts of the code
			    			d3.select(`path.arc-${i}`)
			    			.transition()
			    				.attr('d', arc)
			    		})
						.transition()
						.attr('x', 25)
						.attr('y', (d, i) => i * 25 + 11)
						.attr("font-family", "sans-serif")
                		.attr("font-size", "10px")
						.attr('fill', (d, i) => colors(i))
						.text(d => d.id.toUpperCase());  
}

//Function to render chart title
const renderGraphTitle = (width, height, chartData, constitID) => {
	// Prepare for update - if title, remove title
	svg.selectAll('text.title').remove();

	console.log(chartData);
	if (constitID) {
		console.log(chartData[0].constit);

		const text = svg.append('text')
			.attr('class', 'title')
	      	.attr('x', (width / 2))             
	       	.attr('y', (0 + 25));

        text.append('tspan')
	    	.attr('dx', 0)
	    	.attr('dy', 0)
	        .text(`Result: Brexit referendum, 2016`);

        text.append('tspan')
	    	.attr('x', (width / 2))
	    	.attr('dy', '2em')
	    	.text(`Constituency: ${chartData[0].constit}`);
	} else {
		const text = svg.append('text')
			.attr('class', 'title')
	      	.attr('x', (width / 2))             
	       	.attr('y', (0 + 25));

        text.append('tspan')
	    	.attr('dx', 0)
	    	.attr('dy', 0)
	        .text(`Result: Brexit referendum, 2016`);

        text.append('tspan')
	    	.attr('x', (width / 2))
	    	.attr('dy', '2em')
	    	.text(`Constituency: All constituencies`);
	}
}

const renderPie = (width, height, datasrc) => {
    const pie = d3.pie() 
            .sort((d) => d.id)
            .value((d) => d.value);

    const arc = d3.arc()
            .outerRadius(radius)
            .innerRadius(innerRadius);
    // This arc generator will be used on hover in the render slices function
    const arcMouseover = d3.arc()
    		.outerRadius(radius + 10)
    		.innerRadius(innerRadius)
    		.padAngle(0.07);

    if (!pieGroup)
        pieGroup = bodyGroup.append('g')
                .attr('class', 'pie');

    renderSlices(pie, arc, arcMouseover, datasrc);
    renderLabels(pie, arc, datasrc);
    renderLegend(width, height, datasrc, arc, arcMouseover);
}

const renderSlices = (pie, arc, arcMouseover, datasrc) => {
    const slices = pieGroup.selectAll('path.arc')
            .data(pie(datasrc));

    slices.enter()
            .append('path')
        .merge(slices)
            .attr('class', (d, i) => `arc arc-${i}`)
            .attr('fill', (d, i) => colors(i))
            // A pretty basic hover effect (avoid arrow function here)
            .on('mouseover', function(d) {
				d3.select(this)
					.transition()
					.attr('d', arcMouseover)
				})
    		.on('mouseout', function(d) {
    			d3.select(this)
    			.transition()
    				.attr('d', arc)
    		})
        .transition()
            .duration(duration)
            // No arrow function here to maintain functionality of 'this'
            .attr('stroke', 'white')
            .attr('stroke-width', 3)
            // Transitioning with the arc generator means a tweening function is necessary to interpolate the various stages
            .attrTween('d', function (d) {
                let currentArc = this.__current__;

                if (!currentArc)
                    currentArc = {startAngle: 0,
                                    endAngle: 0};

                const interpolate = d3.interpolate(currentArc, d);

                this.__current__ = interpolate(1);

                return (t) => arc(interpolate(t));
            });
}


const renderLabels = (pie, arc, datasrc) => {
    const labels = pieGroup.selectAll('text.pie-label')
            .data(pie(datasrc));
            
    labels.enter()
        		.append('text')	
		  .merge(labels)
		  		
		  		.text((d) => `${d.data.value.toFixed(1)}%`)
		  		.attr('class', 'pie-label')
		  		.style('opacity', 0)
		  		.transition()
            	.duration(duration)
            	.attr('transform', (d) => {
		            	return `translate(${arc.centroid(d)})`;
		          })
            	.attr('text-anchor', 'middle')
            	.style('opacity', 1);  	  
}

// Function to render the chart body
const renderBody = (width, height, datasrc) => {

	if (!bodyGroup) {
		bodyGroup = svg.append('g')
			.attr('class', 'body')
			.attr('transform', `translate(${width / 2}, ${height / 2 + 25})`);
	} 
	renderPie(width, height, datasrc);
}


// Export a function that uses all of the above to generate final chart

export const renderChart = (data, width, height, DOMTarget, constitID) => {
	const chartData = genChartData(data, constitID);
	createSVG(width, height, DOMTarget);
	renderGraphTitle(width, height, chartData, constitID);
	renderBody(width, height, chartData);
	
}	

// Export function to update chart with new data

export const updatePieChart = (data, width, height, DOMTarget, constitID) => {
	const chartData = genChartData(data, constitID);
	createSVG(width, height, DOMTarget);
	renderGraphTitle(width, height, chartData, constitID);
	renderBody(width, height, chartData);	
}


