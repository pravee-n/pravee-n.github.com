

<!-- Start bows.js -->

<!-- End bows.js -->

<!-- Start commons.js -->

## mainData

<!-- End commons.js -->

<!-- Start fillMap.js -->

## FillMap()

<!-- End fillMap.js -->

<!-- Start data.js -->

## retreiveData()

retreive data from the server.

## getData(callback)

Function to return data.

### Params: 

* **Function** *callback* Callback function to be passed when data is processed.

### Return:

* **Object** data Object

<!-- End data.js -->

<!-- Start main.js -->

## google

<!-- End main.js -->

<!-- Start markerclusterer.js -->

slint browser: true, confusion: true, sloppy: true, vars: true, nomen: false, plusplus: false, indent: 2

lobal window,google

@name MarkerClustererPlus for Google Maps V3

Author: Gary Little

Version: 2.0.15 [October 18, 2012]

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## This class represents the object for values in the &lt;code&gt;styles&lt;/code&gt; array passed

@name ClusterIconStyle

## This class is an object containing general information about a cluster icon. This is

@name ClusterIconInfo

## ClusterIcon(cluster, [styles])

A cluster icon.

### Params: 

* **Cluster** *cluster* The cluster with which the icon is to be associated.

* **Array** *[styles]* An array of {@link ClusterIconStyle} defining the cluster icons

## onAdd()

Adds the icon to the DOM.

## MarkerClusterer#click

This event is fired when a cluster marker is clicked.

### Params: 

* **Cluster** *c* The cluster that was clicked.

## MarkerClusterer#mouseover

This event is fired when the mouse moves over a cluster marker.

### Params: 

* **Cluster** *c* The cluster that the mouse moved over.

## MarkerClusterer#mouseout

This event is fired when the mouse moves out of a cluster marker.

### Params: 

* **Cluster** *c* The cluster that the mouse moved out of.

## onRemove()

Removes the icon from the DOM.

## draw()

Draws the icon.

## hide()

Hides the icon.

## show()

Positions and shows the icon.

## useStyle(sums)

Sets the icon styles to the appropriate element in the styles array.

### Params: 

* **ClusterIconInfo** *sums* The icon label text and styles index.

## setCenter(center)

Sets the position at which to center the icon.

### Params: 

* **google.maps.LatLng** *center* The latlng to set as the center.

## createCss(pos)

Creates the cssText style parameter based on the position of the icon.

### Params: 

* **google.maps.Point** *pos* The position of the icon.

### Return:

* **string** The CSS style text.

## getPosFromLatLng_(latlng)

Returns the position at which to place the DIV depending on the latlng.

### Params: 

* **google.maps.LatLng** *latlng* The position in latlng.

### Return:

* **google.maps.Point** The position in pixels.

## Cluster(mc)

Creates a single cluster that manages a group of proximate markers.
 Used internally, do not call this constructor directly.

### Params: 

* **MarkerClusterer** *mc* The &lt;code&gt;MarkerClusterer&lt;/code&gt; object with which this

## getSize()

Returns the number of markers managed by the cluster. You can call this from
a &lt;code&gt;click&lt;/code&gt;, &lt;code&gt;mouseover&lt;/code&gt;, or &lt;code&gt;mouseout&lt;/code&gt; event handler
for the &lt;code&gt;MarkerClusterer&lt;/code&gt; object.

### Return:

* **number** The number of markers in the cluster.

## getMarkers()

Returns the array of markers managed by the cluster. You can call this from
a &lt;code&gt;click&lt;/code&gt;, &lt;code&gt;mouseover&lt;/code&gt;, or &lt;code&gt;mouseout&lt;/code&gt; event handler
for the &lt;code&gt;MarkerClusterer&lt;/code&gt; object.

### Return:

* **Array** The array of markers in the cluster.

## getCenter()

Returns the center of the cluster. You can call this from
a &lt;code&gt;click&lt;/code&gt;, &lt;code&gt;mouseover&lt;/code&gt;, or &lt;code&gt;mouseout&lt;/code&gt; event handler
for the &lt;code&gt;MarkerClusterer&lt;/code&gt; object.

### Return:

* **google.maps.LatLng** The center of the cluster.

## getMap()

Returns the map with which the cluster is associated.

### Return:

* **google.maps.Map** The map.

## getMarkerClusterer()

Returns the &lt;code&gt;MarkerClusterer&lt;/code&gt; object with which the cluster is associated.

### Return:

* **MarkerClusterer** The associated marker clusterer.

## getBounds()

Returns the bounds of the cluster.

### Return:

* **google.maps.LatLngBounds** the cluster bounds.

## remove()

Removes the cluster from the map.

## addMarker(marker)

Adds a marker to the cluster.

### Params: 

* **google.maps.Marker** *marker* The marker to be added.

### Return:

* **boolean** True if the marker was added.

## isMarkerInClusterBounds(marker)

Determines if a marker lies within the cluster's bounds.

### Params: 

* **google.maps.Marker** *marker* The marker to check.

### Return:

* **boolean** True if the marker lies in the bounds.

## calculateBounds_()

Calculates the extended bounds of the cluster with the grid.

## updateIcon_()

Updates the cluster icon.

## isMarkerAlreadyAdded_(marker)

Determines if a marker has already been added to the cluster.

### Params: 

* **google.maps.Marker** *marker* The marker to check.

### Return:

* **boolean** True if the marker has already been added.

## This class represents the optional parameter passed to

@name MarkerClustererOptions

## MarkerClusterer(map, [opt_markers], [opt_options])

Creates a MarkerClusterer object with the options specified in {@link MarkerClustererOptions}.

### Params: 

* **google.maps.Map** *map* The Google map to attach to.

* **Array.&lt;google.maps.Marker&gt;** *[opt_markers]* The markers to be added to the cluster.

* **MarkerClustererOptions** *[opt_options]* The optional parameters.

## onAdd()

Implementation of the onAdd interface method.

## onRemove()

Implementation of the onRemove interface method.
Removes map event listeners and all cluster icons from the DOM.
All managed markers are also put back on the map.

## draw()

Implementation of the draw interface method.

## setupStyles_()

Sets up the styles object.

## fitMapToMarkers()

Fits the map to the bounds of the markers managed by the clusterer.

## getGridSize()

Returns the value of the &lt;code&gt;gridSize&lt;/code&gt; property.

### Return:

* **number** The grid size.

## setGridSize(gridSize)

Sets the value of the &lt;code&gt;gridSize&lt;/code&gt; property.

### Params: 

* **number** *gridSize* The grid size.

## getMinimumClusterSize()

Returns the value of the &lt;code&gt;minimumClusterSize&lt;/code&gt; property.

### Return:

* **number** The minimum cluster size.

## setMinimumClusterSize(minimumClusterSize)

Sets the value of the &lt;code&gt;minimumClusterSize&lt;/code&gt; property.

### Params: 

* **number** *minimumClusterSize* The minimum cluster size.

## getMaxZoom()

Returns the value of the &lt;code&gt;maxZoom&lt;/code&gt; property.

 @return {number} The maximum zoom level.

## setMaxZoom()

Sets the value of the &lt;code&gt;maxZoom&lt;/code&gt; property.

 @param {number} maxZoom The maximum zoom level.

## getStyles()

Returns the value of the &lt;code&gt;styles&lt;/code&gt; property.

 @return {Array} The array of styles defining the cluster markers to be used.

## setStyles()

Sets the value of the &lt;code&gt;styles&lt;/code&gt; property.

 @param {Array.&lt;ClusterIconStyle&gt;} styles The array of styles to use.

## getTitle()

Returns the value of the &lt;code&gt;title&lt;/code&gt; property.

### Return:

* **string** The content of the title text.

## setTitle()

Sets the value of the &lt;code&gt;title&lt;/code&gt; property.

 @param {string} title The value of the title property.

## getZoomOnClick()

Returns the value of the &lt;code&gt;zoomOnClick&lt;/code&gt; property.

### Return:

* **boolean** True if zoomOnClick property is set.

## setZoomOnClick()

Sets the value of the &lt;code&gt;zoomOnClick&lt;/code&gt; property.

 @param {boolean} zoomOnClick The value of the zoomOnClick property.

## getAverageCenter()

Returns the value of the &lt;code&gt;averageCenter&lt;/code&gt; property.

### Return:

* **boolean** True if averageCenter property is set.

## setAverageCenter()

Sets the value of the &lt;code&gt;averageCenter&lt;/code&gt; property.

 @param {boolean} averageCenter The value of the averageCenter property.

## getIgnoreHidden()

Returns the value of the &lt;code&gt;ignoreHidden&lt;/code&gt; property.

### Return:

* **boolean** True if ignoreHidden property is set.

## setIgnoreHidden()

Sets the value of the &lt;code&gt;ignoreHidden&lt;/code&gt; property.

 @param {boolean} ignoreHidden The value of the ignoreHidden property.

## getImageExtension()

Returns the value of the &lt;code&gt;imageExtension&lt;/code&gt; property.

### Return:

* **string** The value of the imageExtension property.

## setImageExtension()

Sets the value of the &lt;code&gt;imageExtension&lt;/code&gt; property.

 @param {string} imageExtension The value of the imageExtension property.

## getImagePath()

Returns the value of the &lt;code&gt;imagePath&lt;/code&gt; property.

### Return:

* **string** The value of the imagePath property.

## setImagePath()

Sets the value of the &lt;code&gt;imagePath&lt;/code&gt; property.

 @param {string} imagePath The value of the imagePath property.

## getImageSizes()

Returns the value of the &lt;code&gt;imageSizes&lt;/code&gt; property.

### Return:

* **Array** The value of the imageSizes property.

## setImageSizes()

Sets the value of the &lt;code&gt;imageSizes&lt;/code&gt; property.

 @param {Array} imageSizes The value of the imageSizes property.

## getCalculator()

Returns the value of the &lt;code&gt;calculator&lt;/code&gt; property.

### Return:

* **function** the value of the calculator property.

## setCalculator(number)})

Sets the value of the &lt;code&gt;calculator&lt;/code&gt; property.

### Params: 

* **function(Array.&lt;google.maps.Marker&gt;|** *number)}* calculator The value

## getPrintable()

Returns the value of the &lt;code&gt;printable&lt;/code&gt; property.

### Return:

* **boolean** the value of the printable property.

## setPrintable()

Sets the value of the &lt;code&gt;printable&lt;/code&gt; property.

 @param {boolean} printable The value of the printable property.

## getBatchSizeIE()

Returns the value of the &lt;code&gt;batchSizeIE&lt;/code&gt; property.

### Return:

* **number** the value of the batchSizeIE property.

## setBatchSizeIE()

Sets the value of the &lt;code&gt;batchSizeIE&lt;/code&gt; property.

 @param {number} batchSizeIE The value of the batchSizeIE property.

## getClusterClass()

Returns the value of the &lt;code&gt;clusterClass&lt;/code&gt; property.

### Return:

* **string** the value of the clusterClass property.

## setClusterClass()

Sets the value of the &lt;code&gt;clusterClass&lt;/code&gt; property.

 @param {string} clusterClass The value of the clusterClass property.

## getMarkers()

Returns the array of markers managed by the clusterer.

 @return {Array} The array of markers managed by the clusterer.

## getTotalMarkers()

Returns the number of markers managed by the clusterer.

 @return {number} The number of markers.

## getClusters()

Returns the current array of clusters formed by the clusterer.

### Return:

* **Array** The array of clusters formed by the clusterer.

## getTotalClusters()

Returns the number of clusters formed by the clusterer.

### Return:

* **number** The number of clusters formed by the clusterer.

## addMarker(marker, [opt_nodraw])

Adds a marker to the clusterer. The clusters are redrawn unless
 &lt;code&gt;opt_nodraw&lt;/code&gt; is set to &lt;code&gt;true&lt;/code&gt;.

### Params: 

* **google.maps.Marker** *marker* The marker to add.

* **boolean** *[opt_nodraw]* Set to &lt;code&gt;true&lt;/code&gt; to prevent redrawing.

## addMarkers(markers, [opt_nodraw])

Adds an array of markers to the clusterer. The clusters are redrawn unless
 &lt;code&gt;opt_nodraw&lt;/code&gt; is set to &lt;code&gt;true&lt;/code&gt;.

### Params: 

* **Array.&lt;google.maps.Marker&gt;** *markers* The markers to add.

* **boolean** *[opt_nodraw]* Set to &lt;code&gt;true&lt;/code&gt; to prevent redrawing.

## pushMarkerTo_(marker)

Pushes a marker to the clusterer.

### Params: 

* **google.maps.Marker** *marker* The marker to add.

## removeMarker(marker, [opt_nodraw])

Removes a marker from the cluster.  The clusters are redrawn unless
 &lt;code&gt;opt_nodraw&lt;/code&gt; is set to &lt;code&gt;true&lt;/code&gt;. Returns &lt;code&gt;true&lt;/code&gt; if the
 marker was removed from the clusterer.

### Params: 

* **google.maps.Marker** *marker* The marker to remove.

* **boolean** *[opt_nodraw]* Set to &lt;code&gt;true&lt;/code&gt; to prevent redrawing.

### Return:

* **boolean** True if the marker was removed from the clusterer.

## removeMarkers(markers, [opt_nodraw])

Removes an array of markers from the cluster. The clusters are redrawn unless
 &lt;code&gt;opt_nodraw&lt;/code&gt; is set to &lt;code&gt;true&lt;/code&gt;. Returns &lt;code&gt;true&lt;/code&gt; if markers
 were removed from the clusterer.

### Params: 

* **Array.&lt;google.maps.Marker&gt;** *markers* The markers to remove.

* **boolean** *[opt_nodraw]* Set to &lt;code&gt;true&lt;/code&gt; to prevent redrawing.

### Return:

* **boolean** True if markers were removed from the clusterer.

## removeMarker_(marker)

Removes a marker and returns true if removed, false if not.

### Params: 

* **google.maps.Marker** *marker* The marker to remove

### Return:

* **boolean** Whether the marker was removed or not

## clearMarkers()

Removes all clusters and markers from the map and also removes all markers
 managed by the clusterer.

## repaint()

Recalculates and redraws all the marker clusters from scratch.
 Call this after changing any properties.

## getExtendedBounds(bounds)

Returns the current bounds extended by the grid size.

### Params: 

* **google.maps.LatLngBounds** *bounds* The bounds to extend.

### Return:

* **google.maps.LatLngBounds** The extended bounds.

## redraw_()

Redraws all the clusters.

## resetViewport_([opt_hide])

Removes all clusters from the map. The markers are also removed from the map
 if &lt;code&gt;opt_hide&lt;/code&gt; is set to &lt;code&gt;true&lt;/code&gt;.

### Params: 

* **boolean** *[opt_hide]* Set to &lt;code&gt;true&lt;/code&gt; to also remove the markers

## distanceBetweenPoints_(p1, p2)

Calculates the distance between two latlng locations in km.

### Params: 

* **google.maps.LatLng** *p1* The first lat lng point.

* **google.maps.LatLng** *p2* The second lat lng point.

### Return:

* **number** The distance between the two points in km.

## isMarkerInBounds_(marker, bounds)

Determines if a marker is contained in a bounds.

### Params: 

* **google.maps.Marker** *marker* The marker to check.

* **google.maps.LatLngBounds** *bounds* The bounds to check against.

### Return:

* **boolean** True if the marker is in the bounds.

## addToClosestCluster_(marker)

Adds a marker to a cluster, or creates a new cluster.

### Params: 

* **google.maps.Marker** *marker* The marker to add.

## createClusters_(iFirst)

Creates the clusters. This is done in batches to avoid timeout errors
 in some browsers when there is a huge number of markers.

### Params: 

* **number** *iFirst* The index of the first marker in the batch of

## MarkerClusterer#clusteringbegin

This event is fired when the &lt;code&gt;MarkerClusterer&lt;/code&gt; begins
 clustering markers.

### Params: 

* **MarkerClusterer** *mc* The MarkerClusterer whose markers are being clustered.

## MarkerClusterer#clusteringend

This event is fired when the &lt;code&gt;MarkerClusterer&lt;/code&gt; stops
 clustering markers.

### Params: 

* **MarkerClusterer** *mc* The MarkerClusterer whose markers are being clustered.

## extend(obj1, obj2)

Extends an object's prototype by another's.

### Params: 

* **Object** *obj1* The object to be extended.

* **Object** *obj2* The object to extend with.

### Return:

* **Object** The new extended object.

## CALCULATOR(markers, numStyles)

The default function for determining the label text and style
for a cluster icon.

### Params: 

* **Array.&lt;google.maps.Marker&gt;** *markers* The array of markers represented by the cluster.

* **number** *numStyles* The number of marker styles available.

### Return:

* **ClusterIconInfo** The information resource for the cluster.

## BATCH_SIZE

The number of markers to process in one batch.

## BATCH_SIZE_IE

The number of markers to process in one batch (IE only).

## IMAGE_PATH

The default root name for the marker cluster images.

## IMAGE_EXTENSION

The default extension name for the marker cluster images.

## IMAGE_SIZES

The default array of sizes for the marker cluster images.

<!-- End markerclusterer.js -->

<!-- Start markers.js -->

## markers

Retreives stores data and converts it into markers

### Return:

* **[type]** [description]

<!-- End markers.js -->

<!-- Start modules.js -->

## DistanceWidget(map)

A distance widget that will display a circle that can be resized and will
provide the radius in km.

### Params: 

* **google.maps.Map** *map* The map on which to attach the distance widget.

## RadiusWidget()

A radius widget that add a circle to a map and centers on a marker.

## distance_changed()

Update the radius when the distance has changed.

## addSizer_()

Add the sizer marker to the map.

## center_changed()

Update the center of the circle and position the sizer back on the line.

Position is bound to the DistanceWidget so this is expected to change when
the position of the distance widget is changed.

<!-- End modules.js -->

<!-- Start search.js -->

## initializeMap()

Initialize Map on the page.

## init()

initialize the search view Controller

<!-- End search.js -->

<!-- Start fontawesome-markers.js -->

## fontawesome

<!-- End fontawesome-markers.js -->

