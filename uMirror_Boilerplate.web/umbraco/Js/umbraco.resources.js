/*! umbraco - v7.0.0-Beta - 2013-12-05
 * https://github.com/umbraco/umbraco-cms/tree/7.0.0
 * Copyright (c) 2013 Umbraco HQ;
 * Licensed MIT
 */

(function() { 

angular.module("umbraco.resources", []);
/**
    * @ngdoc service
    * @name umbraco.resources.authResource
    * @description Loads in data for authentication
**/
function authResource($q, $http, umbRequestHelper, angularHelper) {

    return {
        //currentUser: currentUser,

        /** Logs the user in if the credentials are good */
        performLogin: function (username, password) {
            
            if (!username || !password) {
                return angularHelper.rejectedPromise({
                    errorMsg: 'Username or password cannot be empty'
                });
            }

            return umbRequestHelper.resourcePromise(
                $http.post(
                    umbRequestHelper.getApiUrl(
                        "authenticationApiBaseUrl",
                        "PostLogin",
                        [{ username: username }, { password: password }])),
                'Login failed for user ' + username);
        },
        
        performLogout: function() {
            return umbRequestHelper.resourcePromise(
                $http.post(
                    umbRequestHelper.getApiUrl(
                        "authenticationApiBaseUrl",
                        "PostLogout")));
        },
        
        /** Sends a request to the server to get the current user details, will return a 401 if the user is not logged in  */
        getCurrentUser: function () {
            
            return umbRequestHelper.resourcePromise(
                $http.get(
                    umbRequestHelper.getApiUrl(
                        "authenticationApiBaseUrl",
                        "GetCurrentUser")),
                'Server call failed for getting current user'); 
        },
        
        /** Checks if the user is logged in or not - does not return 401 or 403 */
        isAuthenticated: function () {

            return umbRequestHelper.resourcePromise(
                $http.get(
                    umbRequestHelper.getApiUrl(
                        "authenticationApiBaseUrl",
                        "IsAuthenticated")),
                'Server call failed for checking authentication');
        },
        
        /** Gets the user's remaining seconds before their login times out */
        getRemainingTimeoutSeconds: function () {

            return umbRequestHelper.resourcePromise(
                $http.get(
                    umbRequestHelper.getApiUrl(
                        "authenticationApiBaseUrl",
                        "GetRemainingTimeoutSeconds")),
                'Server call failed for checking remaining seconds');
        }

    };
}

angular.module('umbraco.resources').factory('authResource', authResource);

/**
  * @ngdoc service
  * @name umbraco.resources.contentResource
  * @description Handles all transactions of content data
  * from the angular application to the Umbraco database, using the Content WebApi controller
  *
  * all methods returns a resource promise async, so all operations won't complete untill .then() is completed.
  *
  * @requires $q
  * @requires $http
  * @requires umbDataFormatter
  * @requires umbRequestHelper
  *
  * ##usage
  * To use, simply inject the contentResource into any controller or service that needs it, and make
  * sure the umbraco.resources module is accesible - which it should be by default.
  *
  * <pre>
  *    contentResource.getById(1234)
  *          .then(function(data) {
  *              $scope.content = data;
  *          });    
  * </pre> 
  **/

function contentResource($q, $http, umbDataFormatter, umbRequestHelper) {

    /** internal method process the saving of data and post processing the result */
    function saveContentItem(content, action, files) {
        return umbRequestHelper.postSaveContent({
            restApiUrl: umbRequestHelper.getApiUrl(
                "contentApiBaseUrl",
                "PostSave"),
            content: content,
            action: action,
            files: files,
            dataFormatter: function (c, a) {
                return umbDataFormatter.formatContentPostData(c, a);
            }
        });
    }

    return {
        
        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#sort
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Sorts all children below a given parent node id, based on a collection of node-ids
         *
         * ##usage
         * <pre>
         * var ids = [123,34533,2334,23434];
         * contentResource.sort({ parentId: 1244, sortedIds: ids })
         *    .then(function() {
         *        $scope.complete = true;
         *    });
         * </pre> 
         * @param {Object} args arguments object
         * @param {Int} args.parentId the ID of the parent node
         * @param {Array} options.sortedIds array of node IDs as they should be sorted
         * @returns {Promise} resourcePromise object.
         *
         */
        sort: function (args) {
            if (!args) {
                throw "args cannot be null";
            }
            if (!args.parentId) {
                throw "args.parentId cannot be null";
            }
            if (!args.sortedIds) {
                throw "args.sortedIds cannot be null";
            }

            return umbRequestHelper.resourcePromise(
                $http.post(umbRequestHelper.getApiUrl("contentApiBaseUrl", "PostSort"),
                    {
                        parentId: args.parentId,
                        idSortOrder: args.sortedIds
                    }),
                'Failed to sort content');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#move
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Moves a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * contentResource.move({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was moved");
         *    }, function(err){
         *      alert("node didnt move:" + err.data.Message); 
         *    });
         * </pre> 
         * @param {Object} args arguments object
         * @param {Int} args.idd the ID of the node to move
         * @param {Int} args.parentId the ID of the parent node to move to
         * @returns {Promise} resourcePromise object.
         *
         */
        move: function (args) {
            if (!args) {
                throw "args cannot be null";
            }
            if (!args.parentId) {
                throw "args.parentId cannot be null";
            }
            if (!args.id) {
                throw "args.id cannot be null";
            }

            return umbRequestHelper.resourcePromise(
                $http.post(umbRequestHelper.getApiUrl("contentApiBaseUrl", "PostMove"),
                    {
                        parentId: args.parentId,
                        id: args.id
                    }),
                'Failed to move content');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#copy
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Copies a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * contentResource.copy({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was copied");
         *    }, function(err){
         *      alert("node wasnt copy:" + err.data.Message); 
         *    });
         * </pre> 
         * @param {Object} args arguments object
         * @param {Int} args.id the ID of the node to copy
         * @param {Int} args.parentId the ID of the parent node to copy to
         * @param {Boolean} args.relateToOriginal if true, relates the copy to the original through the relation api
         * @returns {Promise} resourcePromise object.
         *
         */
        copy: function (args) {
            if (!args) {
                throw "args cannot be null";
            }
            if (!args.parentId) {
                throw "args.parentId cannot be null";
            }
            if (!args.id) {
                throw "args.id cannot be null";
            }

            return umbRequestHelper.resourcePromise(
                $http.post(umbRequestHelper.getApiUrl("contentApiBaseUrl", "PostCopy"),
                    args),
                'Failed to copy content');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#unPublish
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Unpublishes a content item with a given Id
         *
         * ##usage
         * <pre>
         * contentResource.unPublish(1234)
         *    .then(function() {
         *        alert("node was unpulished");
         *    }, function(err){
         *      alert("node wasnt unpublished:" + err.data.Message); 
         *    });
         * </pre> 
         * @param {Int} id the ID of the node to unpublish
         * @returns {Promise} resourcePromise object.
         *
         */
        unPublish: function (id) {
            if (!id) {
                throw "id cannot be null";
            }
         
            return umbRequestHelper.resourcePromise(
                           $http.post(
                               umbRequestHelper.getApiUrl(
                                   "contentApiBaseUrl",
                                   "PostUnPublish",
                                   [{ id: id }])),
                           'Failed to publish content with id ' + id);
        },
        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#emptyRecycleBin
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Empties the content recycle bin
         *
         * ##usage
         * <pre>
         * contentResource.emptyRecycleBin()
         *    .then(function() {
         *        alert('its empty!');
         *    });
         * </pre> 
         *         
         * @returns {Promise} resourcePromise object.
         *
         */
        emptyRecycleBin: function() {
            return umbRequestHelper.resourcePromise(
                $http.delete(
                    umbRequestHelper.getApiUrl(
                        "contentApiBaseUrl",
                        "EmptyRecycleBin")),
                'Failed to empty the recycle bin');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#deleteById
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Deletes a content item with a given id
         *
         * ##usage
         * <pre>
         * contentResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of content item to delete        
         * @returns {Promise} resourcePromise object.
         *
         */
        deleteById: function(id) {
            return umbRequestHelper.resourcePromise(
                $http.delete(
                    umbRequestHelper.getApiUrl(
                        "contentApiBaseUrl",
                        "DeleteById",
                        [{ id: id }])),
                'Failed to delete item ' + id);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getById
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Gets a content item with a given id
         *
         * ##usage
         * <pre>
         * contentResource.getById(1234)
         *    .then(function(content) {
         *        var myDoc = content; 
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of content item to return        
         * @returns {Promise} resourcePromise object containing the content item.
         *
         */
        getById: function (id) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "contentApiBaseUrl",
                       "GetById",
                       [{ id: id }])),
               'Failed to retreive data for content id ' + id);
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getByIds
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Gets an array of content items, given a collection of ids
         *
         * ##usage
         * <pre>
         * contentResource.getByIds( [1234,2526,28262])
         *    .then(function(contentArray) {
         *        var myDoc = contentArray; 
         *        alert('they are here!');
         *    });
         * </pre> 
         * 
         * @param {Array} ids ids of content items to return as an array        
         * @returns {Promise} resourcePromise object containing the content items array.
         *
         */
        getByIds: function (ids) {
            
            var idQuery = "";
            _.each(ids, function(item) {
                idQuery += "ids=" + item + "&";
            });

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "contentApiBaseUrl",
                       "GetByIds",
                       idQuery)),
               'Failed to retreive data for content with multiple ids');
        },

        
        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getScaffold
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Returns a scaffold of an empty content item, given the id of the content item to place it underneath and the content type alias.
         * 
         * - Parent Id must be provided so umbraco knows where to store the content
         * - Content Type alias must be provided so umbraco knows which properties to put on the content scaffold 
         * 
         * The scaffold is used to build editors for content that has not yet been populated with data.
         * 
         * ##usage
         * <pre>
         * contentResource.getScaffold(1234, 'homepage')
         *    .then(function(scaffold) {
         *        var myDoc = scaffold;
         *        myDoc.name = "My new document"; 
         *
         *        contentResource.publish(myDoc, true)
         *            .then(function(content){
         *                alert("Retrieved, updated and published again");
         *            });
         *    });
         * </pre> 
         * 
         * @param {Int} parentId id of content item to return
         * @param {String} alias contenttype alias to base the scaffold on        
         * @returns {Promise} resourcePromise object containing the content scaffold.
         *
         */
        getScaffold: function (parentId, alias) {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "contentApiBaseUrl",
                       "GetEmpty",
                       [{ contentTypeAlias: alias }, { parentId: parentId }])),
               'Failed to retreive data for empty content item type ' + alias);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getNiceUrl
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Returns a url, given a node ID
         *
         * ##usage
         * <pre>
         * contentResource.getNiceUrl(id)
         *    .then(function(url) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Int} id Id of node to return the public url to
         * @returns {Promise} resourcePromise object containing the url.
         *
         */
        getNiceUrl: function (id) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "contentApiBaseUrl",
                       "GetNiceUrl",[{id: id}])),
               'Failed to retrieve url for id:' + id);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getChildren
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Gets children of a content item with a given id
         *
         * ##usage
         * <pre>
         * contentResource.getChildren(1234, {pageSize: 10, pageNumber: 2})
         *    .then(function(contentArray) {
         *        var children = contentArray; 
         *        alert('they are here!');
         *    });
         * </pre> 
         * 
         * @param {Int} parentid id of content item to return children of
         * @param {Object} options optional options object
         * @param {Int} options.pageSize if paging data, number of nodes per page, default = 0
         * @param {Int} options.pageNumber if paging data, current page index, default = 0
         * @param {String} options.filter if provided, query will only return those with names matching the filter
         * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Ascending`
         * @param {String} options.orderBy property to order items by, default: `SortOrder`
         * @returns {Promise} resourcePromise object containing an array of content items.
         *
         */
        getChildren: function (parentId, options) {

            var defaults = {
                pageSize: 0,
                pageNumber: 0,
                filter: '',
                orderDirection: "Ascending",
                orderBy: "SortOrder"
            };
            if (options === undefined) {
                options = {}; 
            }
            //overwrite the defaults if there are any specified
            angular.extend(defaults, options);
            //now copy back to the options we will use
            options = defaults;
            //change asc/desct
            if (options.orderDirection === "asc") {
                options.orderDirection = "Ascending";
            }
            else if (options.orderDirection === "desc") {
                options.orderDirection = "Descending";
            }

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "contentApiBaseUrl",
                       "GetChildren",
                       [
                           { id: parentId },
                           { pageNumber: options.pageNumber },
                           { pageSize: options.pageSize },
                           { orderBy: options.orderBy },
                           { orderDirection: options.orderDirection },
                           { filter: options.filter }
                       ])),
               'Failed to retreive children for content item ' + parentId);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#hasPermission
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Returns true/false given a permission char to check against a nodeID
         * for the current user
         *
         * ##usage
         * <pre>
         * contentResource.hasPermission('p',1234)
         *    .then(function() {
         *        alert('You are allowed to publish this item');
         *    });
         * </pre> 
         *
         * @param {String} permission char representing the permission to check
         * @param {Int} id id of content item to delete        
         * @returns {Promise} resourcePromise object.
         *
         */
        checkPermission: function(permission, id) {
            return umbRequestHelper.resourcePromise(
                $http.get(
                    umbRequestHelper.getApiUrl(
                        "contentApiBaseUrl",
                        "GetHasPermission",
                        [{ permissionToCheck: permission },{ nodeId: id }])),
                'Failed to check permission for item ' + id);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#save
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Saves changes made to a content item to its current version, if the content item is new, the isNew paramater must be passed to force creation
         * if the content item needs to have files attached, they must be provided as the files param and passed seperately 
         * 
         * 
         * ##usage
         * <pre>
         * contentResource.getById(1234)
         *    .then(function(content) {
         *          content.name = "I want a new name!";
         *          contentResource.save(content, false)
         *            .then(function(content){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre> 
         * 
         * @param {Object} content The content item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing 
         * @param {Array} files collection of files for the document      
         * @returns {Promise} resourcePromise object containing the saved content item.
         *
         */
        save: function (content, isNew, files) {
            return saveContentItem(content, "save" + (isNew ? "New" : ""), files);
        },


        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#publish
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Saves and publishes changes made to a content item to a new version, if the content item is new, the isNew paramater must be passed to force creation
         * if the content item needs to have files attached, they must be provided as the files param and passed seperately 
         * 
         * 
         * ##usage
         * <pre>
         * contentResource.getById(1234)
         *    .then(function(content) {
         *          content.name = "I want a new name, and be published!";
         *          contentResource.publish(content, false)
         *            .then(function(content){
         *                alert("Retrieved, updated and published again");
         *            });
         *    });
         * </pre> 
         * 
         * @param {Object} content The content item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing 
         * @param {Array} files collection of files for the document      
         * @returns {Promise} resourcePromise object containing the saved content item.
         *
         */
        publish: function (content, isNew, files) {
            return saveContentItem(content, "publish" + (isNew ? "New" : ""), files);
        },
        

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#sendToPublish
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Saves changes made to a content item, and notifies any subscribers about a pending publication
         * 
         * ##usage
         * <pre>
         * contentResource.getById(1234)
         *    .then(function(content) {
         *          content.name = "I want a new name, and be published!";
         *          contentResource.sendToPublish(content, false)
         *            .then(function(content){
         *                alert("Retrieved, updated and notication send off");
         *            });
         *    });
         * </pre> 
         * 
         * @param {Object} content The content item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing 
         * @param {Array} files collection of files for the document      
         * @returns {Promise} resourcePromise object containing the saved content item.
         *
         */
        sendToPublish: function (content, isNew, files) {
            return saveContentItem(content, "sendPublish" + (isNew ? "New" : ""), files);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#publishByid
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Publishes a content item with a given ID
         * 
         * ##usage
         * <pre>
         * contentResource.publishById(1234)
         *    .then(function(content) {
         *        alert("published");
         *    });
         * </pre> 
         * 
         * @param {Int} id The ID of the conten to publish
         * @returns {Promise} resourcePromise object containing the published content item.
         *
         */
        publishById: function(id){

            if (!id) {
                throw "id cannot be null";
            }
         
            return umbRequestHelper.resourcePromise(
                           $http.post(
                               umbRequestHelper.getApiUrl(
                                   "contentApiBaseUrl",
                                   "PostPublishById",
                                   [{ id: id }])),
                           'Failed to publish content with id ' + id);
         
        }


    };
}

angular.module('umbraco.resources').factory('contentResource', contentResource);

/**
    * @ngdoc service
    * @name umbraco.resources.contentTypeResource
    * @description Loads in data for content types
    **/
function contentTypeResource($q, $http, umbRequestHelper) {

    return {

        /**
         * @ngdoc method
         * @name umbraco.resources.contentTypeResource#getContentType
         * @methodOf umbraco.resources.contentTypeResource
         *
         * @description
         * Returns a content type with a given ID
         *
         * ##usage
         * <pre>
         * contentTypeResource.getContentType(1234)
         *    .then(function(type) {
         *        $scope.type = type;
         *    });
         * </pre> 
         * @param {Int} id id of the content type to retrieve
         * @returns {Promise} resourcePromise object.
         *
         */
        getContentType: function (id) {

            var deferred = $q.defer();
            var data = {
                name: "News Article",
                alias: "newsArticle",
                id: id,
                tabs: []
            };
            
            deferred.resolve(data);
            return deferred.promise;
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.contentTypeResource#getAllowedTypes
         * @methodOf umbraco.resources.contentTypeResource
         *
         * @description
         * Returns a list of allowed content types underneath a content item with a given ID
         *
         * ##usage
         * <pre>
         * contentTypeResource.getAllowedTypes(1234)
         *    .then(function(array) {
         *        $scope.type = type;
         *    });
         * </pre> 
         * @param {Int} contentId id of the content item to retrive allowed child types for
         * @returns {Promise} resourcePromise object.
         *
         */
        getAllowedTypes: function (contentId) {
           
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "contentTypeApiBaseUrl",
                       "GetAllowedChildren",
                       [{ contentId: contentId }])),
               'Failed to retreive data for content id ' + contentId);
        }

    };
}
angular.module('umbraco.resources').factory('contentTypeResource', contentTypeResource);
/**
    * @ngdoc service
    * @name umbraco.resources.currentUserResource
    * @description Used for read/updates for the currently logged in user
    * 
    *
    **/
function currentUserResource($q, $http, umbRequestHelper) {

    //the factory object returned
    return {
     
        /**
         * @ngdoc method
         * @name umbraco.resources.currentUserResource#changePassword
         * @methodOf umbraco.resources.currentUserResource
         *
         * @description
         * Changes the current users password
         * 
         * @returns {Promise} resourcePromise object containing the user array.
         *
         */
        changePassword: function (changePasswordArgs) {
            return umbRequestHelper.resourcePromise(
               $http.post(
                   umbRequestHelper.getApiUrl(
                       "currentUserApiBaseUrl",
                       "PostChangePassword"),
                       changePasswordArgs),
               'Failed to change password');
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.currentUserResource#getMembershipProviderConfig
         * @methodOf umbraco.resources.currentUserResource
         *
         * @description
         * Gets the configuration of the user membership provider which is used to configure the change password form         
         */
        getMembershipProviderConfig: function () {
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "currentUserApiBaseUrl",
                       "GetMembershipProviderConfig")),
               'Failed to retreive membership provider config');
        },
    };
}

angular.module('umbraco.resources').factory('currentUserResource', currentUserResource);

/**
    * @ngdoc service
    * @name umbraco.resources.dashboardResource
    * @description Handles loading the dashboard manifest
    **/
function dashboardResource($q, $http, umbRequestHelper) {
    //the factory object returned
    return {

        /**
         * @ngdoc method
         * @name umbraco.resources.dashboardResource#getDashboard
         * @methodOf umbraco.resources.dashboardResource
         *
         * @description
         * Retrieves the dashboard configuration for a given section
         * 
         * @param {string} section Alias of section to retrieve dashboard configuraton for
         * @returns {Promise} resourcePromise object containing the user array.
         *
         */
        getDashboard: function (section) {
          
            return umbRequestHelper.resourcePromise(
                $http.get(
                    umbRequestHelper.getApiUrl(
                        "dashboardApiBaseUrl",
                        "GetDashboard",
                        [{ section: section }])),
                'Failed to get dashboard ' + section);
        }
    };
}

angular.module('umbraco.resources').factory('dashboardResource', dashboardResource);
/**
    * @ngdoc service
    * @name umbraco.resources.dataTypeResource
    * @description Loads in data for data types
    **/
function dataTypeResource($q, $http, umbDataFormatter, umbRequestHelper) {
    
    return {
        
        /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#getPreValues
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Retrieves available prevalues for a given data type + editor
         *
         * ##usage
         * <pre>
         * dataTypeResource.getPrevalyes("Umbraco.MediaPicker", 1234)
         *    .then(function(prevalues) {
         *        alert('its gone!');
         *    });
         * </pre> 
         *  
         * @param {String} editorAlias string alias of editor type to retrive prevalues configuration for
         * @param {Int} id id of datatype to retrieve prevalues for        
         * @returns {Promise} resourcePromise object.
         *
         */  
        getPreValues: function (editorAlias, dataTypeId) {

            if (!dataTypeId) {
                dataTypeId = -1;
            }

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "dataTypeApiBaseUrl",
                       "GetPreValues",
                       [{ editorAlias: editorAlias }, { dataTypeId: dataTypeId }])),
               'Failed to retreive pre values for editor alias ' + editorAlias);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#getById
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Gets a data type item with a given id
         *
         * ##usage
         * <pre>
         * dataTypeResource.getById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of data type to retrieve        
         * @returns {Promise} resourcePromise object.
         *
         */
        getById: function (id) {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "dataTypeApiBaseUrl",
                       "GetById",
                       [{ id: id }])),
               'Failed to retreive data for data type id ' + id);
        },

        getAll: function () {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "dataTypeApiBaseUrl",
                       "GetAll")),
               'Failed to retreive data');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.contentResource#getScaffold
         * @methodOf umbraco.resources.contentResource
         *
         * @description
         * Returns a scaffold of an empty data type item
         * 
         * The scaffold is used to build editors for data types that has not yet been populated with data.
         * 
         * ##usage
         * <pre>
         * dataTypeResource.getScaffold()
         *    .then(function(scaffold) {
         *        var myType = scaffold;
         *        myType.name = "My new data type"; 
         *
         *        dataTypeResource.save(myType, myType.preValues, true)
         *            .then(function(type){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre> 
         * 
         * @returns {Promise} resourcePromise object containing the data type scaffold.
         *
         */
        getScaffold: function () {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "dataTypeApiBaseUrl",
                       "GetEmpty")),
               'Failed to retreive data for empty datatype');
        },
        /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#deleteById
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Deletes a data type with a given id
         *
         * ##usage
         * <pre>
         * dataTypeResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of content item to delete        
         * @returns {Promise} resourcePromise object.
         *
         */
        deleteById: function(id) {
            return umbRequestHelper.resourcePromise(
                $http.delete(
                    umbRequestHelper.getApiUrl(
                        "dataTypeApiBaseUrl",
                        "DeleteById",
                        [{ id: id }])),
                'Failed to delete item ' + id);
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.dataTypeResource#deleteById
         * @methodOf umbraco.resources.dataTypeResource
         *
         * @description
         * Saves or update a data typw
         *
         * ##usage
         * <pre>
         * dataTypeResource.getById(1234)
         *    .then(function(type) {
         *        type.name ="hibba";
         *  
         *        dataTypeResource.save(type, type.preValues, false).then(function(type){
         *          alert('its done!');
         *        }): 
         *    });
         * </pre> 
         * 
         * @param {Object} dataType data type object to create/update
         * @param {Array} preValues collection of prevalues on the datatype
         * @param {Bool} isNew set to true if type should be create instead of updated  
         * @returns {Promise} resourcePromise object.
         *
         */
        save: function (dataType, preValues, isNew) {
            
            var saveModel = umbDataFormatter.formatDataTypePostData(dataType, preValues, "save" + (isNew ? "New" : ""));

            return umbRequestHelper.resourcePromise(
                 $http.post(umbRequestHelper.getApiUrl("dataTypeApiBaseUrl", "PostSave"), saveModel),
                'Failed to save data for data type id ' + dataType.id);
        }
    };
}

angular.module('umbraco.resources').factory('dataTypeResource', dataTypeResource);

/**
    * @ngdoc service
    * @name umbraco.resources.entityResource
    * @description Loads in basic data for all entities
    * 
    * ##What is an entity?
    * An entity is a basic **read-only** representation of an Umbraco node. It contains only the most
    * basic properties used to display the item in trees, lists and navigation. 
    *
    * ##What is the difference between entity and content/media/etc...?
    * the entity only contains the basic node data, name, id and guid, whereas content
    * nodes fetched through the content service also contains additional all of the content property data, etc..
    * This is the same principal for all entity types. Any user that is logged in to the back office will have access
    * to view the basic entity information for all entities since the basic entity information does not contain sensitive information.
    *
    * ##Entity object types?
    * You need to specify the type of object you want returned.
    * 
    * The core object types are:
    *
    * - Document
    * - Media
    * - Member
    * - Template
    * - DocumentType
    * - MediaType
    * - MemberType
    * - Macro
    * - User
    * - Language
    * - Domain
    **/
function entityResource($q, $http, umbRequestHelper) {

    //the factory object returned
    return {
        
        /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getPath
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Returns a path, given a node ID and type
         *
         * ##usage
         * <pre>
         * entityResource.getPath(id)
         *    .then(function(pathArray) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Int} id Id of node to return the public url to
         * @param {string} type Object type name     
         * @returns {Promise} resourcePromise object containing the url.
         *
         */
        getPath: function (id, type) {
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "entityApiBaseUrl",
                       "GetPath",
                       [{ id: id }, {type: type }])),
               'Failed to retrieve path for id:' + id);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getById
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an entity with a given id
         *
         * ##usage
         * <pre>
         * //get media by id
         * entityResource.getEntityById(0, "Media")
         *    .then(function(ent) {
         *        var myDoc = ent; 
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of entity to return
         * @param {string} type Object type name        
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
        getById: function (id, type) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "entityApiBaseUrl",
                       "GetById",
                       [{ id: id}, {type: type }])),
               'Failed to retreive entity data for id ' + id);
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getByIds
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an array of entities, given a collection of ids
         *
         * ##usage
         * <pre>
         * //Get templates for ids
         * entityResource.getEntitiesByIds( [1234,2526,28262], "Template")
         *    .then(function(templateArray) {
         *        var myDoc = contentArray; 
         *        alert('they are here!');
         *    });
         * </pre> 
         * 
         * @param {Array} ids ids of entities to return as an array
         * @param {string} type type name        
         * @returns {Promise} resourcePromise object containing the entity array.
         *
         */
        getByIds: function (ids, type) {
            
            var query = "";
            _.each(ids, function(item) {
                query += "ids=" + item + "&";
            });
            query += "type=" + type;

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "entityApiBaseUrl",
                       "GetByIds",
                       query)),
               'Failed to retreive entity data for ids ' + ids);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getEntityById
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an entity with a given id
         *
         * ##usage
         * <pre>
         *
         * //Only return media
         * entityResource.getAll("Media")
         *    .then(function(ent) {
         *        var myDoc = ent; 
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {string} type Object type name        
         * @param {string} postFilter optional filter expression which will execute a dynamic where clause on the server
         * @param {string} postFilterParams optional parameters for the postFilter expression
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
        getAll: function (type, postFilter, postFilterParams) {            

            //need to build the query string manually
            var query = "type=" + type + "&postFilter=" + (postFilter ? postFilter : "");
            if (postFilter && postFilterParams) {
                var counter = 0;
                _.each(postFilterParams, function(val, key) {
                    query += "&postFilterParams[" + counter + "].key=" + key + "&postFilterParams[" + counter + "].value=" + val;
                    counter++;
                });
            } 

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "entityApiBaseUrl",
                       "GetAll",
                       query)),
               'Failed to retreive entity data for type ' + type);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getAncestors
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets ancestor entities for a given item
         *        
         * 
         * @param {string} type Object type name        
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
        getAncestors: function (id, type) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "entityApiBaseUrl",
                       "GetAncestors",
                       [{id: id}, {type: type}])),
               'Failed to retreive ancestor data for id ' + id);
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#getAncestors
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets children entities for a given item
         *        
         * 
         * @param {string} type Object type name        
         * @returns {Promise} resourcePromise object containing the entity.
         *
         */
        getChildren: function (id, type) {
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "entityApiBaseUrl",
                       "GetChildren",
                       [{ id: id }, { type: type }])),
               'Failed to retreive child data for id ' + id);
        },
     
        /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#searchMedia
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an array of entities, given a lucene query and a type
         *
         * ##usage
         * <pre>
         * entityResource.search("news", "Media")
         *    .then(function(mediaArray) {
         *        var myDoc = mediaArray; 
         *        alert('they are here!');
         *    });
         * </pre> 
         * 
         * @param {String} Query search query 
         * @param {String} Type type of conten to search        
         * @returns {Promise} resourcePromise object containing the entity array.
         *
         */
        search: function (query, type) {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "entityApiBaseUrl",
                       "Search",
                       [{ query: query }, {type: type}])),
               'Failed to retreive entity data for query ' + query);
        },
        

        /**
         * @ngdoc method
         * @name umbraco.resources.entityResource#searchAll
         * @methodOf umbraco.resources.entityResource
         *
         * @description
         * Gets an array of entities from all available search indexes, given a lucene query
         *
         * ##usage
         * <pre>
         * entityResource.searchAll("bob")
         *    .then(function(array) {
         *        var myDoc = array; 
         *        alert('they are here!');
         *    });
         * </pre> 
         * 
         * @param {String} Query search query 
         * @returns {Promise} resourcePromise object containing the entity array.
         *
         */
        searchAll: function (query) {

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "entityApiBaseUrl",
                       "SearchAll",
                       [{ query: query }])),
               'Failed to retreive entity data for query ' + query);
        }
            
    };
}

angular.module('umbraco.resources').factory('entityResource', entityResource);

/**
    * @ngdoc service
    * @name umbraco.resources.legacyResource
    * @description Handles legacy dialog requests
    **/
function legacyResource($q, $http, umbRequestHelper) {
   
    //the factory object returned
    return {
        /** Loads in the data to display the section list */
        deleteItem: function (args) {
            
            if (!args.nodeId || !args.nodeType || !args.alias) {
                throw "The args parameter is not formatted correct, it requires properties: nodeId, nodeType, alias";
            } 

            return umbRequestHelper.resourcePromise(
                $http.delete(
                    umbRequestHelper.getApiUrl(
                        "legacyApiBaseUrl",
                        "DeleteLegacyItem",
                        [{ nodeId: args.nodeId }, { nodeType: args.nodeType }, { alias: args.alias }])),
                'Failed to delete item ' + args.nodeId);

        }
    };
}

angular.module('umbraco.resources').factory('legacyResource', legacyResource);
/**
    * @ngdoc service
    * @name umbraco.resources.logResource
    * @description Retrives log history from umbraco
    * 
    *
    **/
function logResource($q, $http, umbRequestHelper) {

    //the factory object returned
    return {
        
        /**
         * @ngdoc method
         * @name umbraco.resources.logResource#getEntityLog
         * @methodOf umbraco.resources.logResource
         *
         * @description
         * Gets the log history for a give entity id
         *
         * ##usage
         * <pre>
         * logResource.getEntityLog(1234)
         *    .then(function(log) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of entity to return log history        
         * @returns {Promise} resourcePromise object containing the log.
         *
         */
        getEntityLog: function (id) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "logApiBaseUrl",
                       "GetEntityLog",
                       [{ id: id }])),
               'Failed to retreive user data for id ' + id);
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.logResource#getUserLog
         * @methodOf umbraco.resources.logResource
         *
         * @description
         * Gets the current users' log history for a given type of log entry
         *
         * ##usage
         * <pre>
         * logResource.getUserLog("save", new Date())
         *    .then(function(log) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {String} type logtype to query for
         * @param {DateTime} since query the log back to this date, by defalt 7 days ago
         * @returns {Promise} resourcePromise object containing the log.
         *
         */
        getUserLog: function (type, since) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "logApiBaseUrl",
                       "GetCurrentUserLog",
                       [{ logtype: type, sinceDate: since }])),
               'Failed to retreive user data for id ' + id);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.logResource#getLog
         * @methodOf umbraco.resources.logResource
         *
         * @description
         * Gets the log history for a given type of log entry
         *
         * ##usage
         * <pre>
         * logResource.getLog("save", new Date())
         *    .then(function(log) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {String} type logtype to query for
         * @param {DateTime} since query the log back to this date, by defalt 7 days ago
         * @returns {Promise} resourcePromise object containing the log.
         *
         */
        getLog: function (type, since) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "logApiBaseUrl",
                       "GetLog",
                       [{ logtype: type, sinceDate: since }])),
               'Failed to retreive user data for id ' + id);
        }
    };
}

angular.module('umbraco.resources').factory('logResource', logResource);

/**
    * @ngdoc service
    * @name umbraco.resources.macroResource
    * @description Deals with data for macros
    * 
    **/
function macroResource($q, $http, umbRequestHelper) {

    //the factory object returned
    return {
        
        /**
         * @ngdoc method
         * @name umbraco.resources.macroResource#getMacroParameters
         * @methodOf umbraco.resources.macroResource
         *
         * @description
         * Gets the editable macro parameters for the specified macro alias
         *
         * @param {int} macroId The macro id to get parameters for
         *
         */
        getMacroParameters: function (macroId) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "macroApiBaseUrl",
                       "GetMacroParameters",
                       [{ macroId: macroId }])),
               'Failed to retreive macro parameters for macro with id  ' + macroId);
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.macroResource#getMacroResult
         * @methodOf umbraco.resources.macroResource
         *
         * @description
         * Gets the result of a macro as html to display in the rich text editor
         *
         * @param {int} macroId The macro id to get parameters for
         * @param {int} pageId The current page id
         * @param {Array} macroParamDictionary A dictionary of macro parameters
         *
         */
        getMacroResultAsHtmlForEditor: function (macroAlias, pageId, macroParamDictionary) {

            //need to format the query string for the custom dictionary
            var query = "macroAlias=" + macroAlias + "&pageId=" + pageId;
            if (macroParamDictionary) {
                var counter = 0;
                _.each(macroParamDictionary, function(val, key) {
                    query += "&macroParams[" + counter + "].key=" + key + "&macroParams[" + counter + "].value=" + val;
                    counter++;
                });
            }

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "macroApiBaseUrl",
                       "GetMacroResultAsHtmlForEditor",
                       query)),
               'Failed to retreive macro result for macro with alias  ' + macroAlias);
        }
            
    };
}

angular.module('umbraco.resources').factory('macroResource', macroResource);

/**
    * @ngdoc service
    * @name umbraco.resources.mediaResource
    * @description Loads in data for media
    **/
function mediaResource($q, $http, umbDataFormatter, umbRequestHelper) {
    
    /** internal method process the saving of data and post processing the result */
    function saveMediaItem(content, action, files) {
        return umbRequestHelper.postSaveContent({
            restApiUrl: umbRequestHelper.getApiUrl(
                "mediaApiBaseUrl",
                "PostSave"),
            content: content,
            action: action,
            files: files,
            dataFormatter: function (c, a) {
                return umbDataFormatter.formatMediaPostData(c, a);
            }
        });
    }

    return {
        
        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#sort
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Sorts all children below a given parent node id, based on a collection of node-ids
         *
         * ##usage
         * <pre>
         * var ids = [123,34533,2334,23434];
         * mediaResource.sort({ sortedIds: ids })
         *    .then(function() {
         *        $scope.complete = true;
         *    });
         * </pre> 
         * @param {Object} args arguments object
         * @param {Int} args.parentId the ID of the parent node
         * @param {Array} options.sortedIds array of node IDs as they should be sorted
         * @returns {Promise} resourcePromise object.
         *
         */
        sort: function (args) {
            if (!args) {
                throw "args cannot be null";
            }
            if (!args.parentId) {
                throw "args.parentId cannot be null";
            }
            if (!args.sortedIds) {
                throw "args.sortedIds cannot be null";
            }

            return umbRequestHelper.resourcePromise(
                $http.post(umbRequestHelper.getApiUrl("mediaApiBaseUrl", "PostSort"),
                    {
                        parentId: args.parentId,
                        idSortOrder: args.sortedIds
                    }),
                'Failed to sort media');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#move
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Moves a node underneath a new parentId
         *
         * ##usage
         * <pre>
         * mediaResource.move({ parentId: 1244, id: 123 })
         *    .then(function() {
         *        alert("node was moved");
         *    }, function(err){
         *      alert("node didnt move:" + err.data.Message); 
         *    });
         * </pre> 
         * @param {Object} args arguments object
         * @param {Int} args.idd the ID of the node to move
         * @param {Int} args.parentId the ID of the parent node to move to
         * @returns {Promise} resourcePromise object.
         *
         */
        move: function (args) {
            if (!args) {
                throw "args cannot be null";
            }
            if (!args.parentId) {
                throw "args.parentId cannot be null";
            }
            if (!args.id) {
                throw "args.id cannot be null";
            }

            return umbRequestHelper.resourcePromise(
                $http.post(umbRequestHelper.getApiUrl("mediaApiBaseUrl", "PostMove"),
                    {
                        parentId: args.parentId,
                        id: args.id
                    }),
                'Failed to move media');
        },


        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getById
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Gets a media item with a given id
         *
         * ##usage
         * <pre>
         * mediaResource.getById(1234)
         *    .then(function(media) {
         *        var myMedia = media; 
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of media item to return        
         * @returns {Promise} resourcePromise object containing the media item.
         *
         */
        getById: function (id) {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "mediaApiBaseUrl",
                       "GetById",
                       [{ id: id }])),
               'Failed to retreive data for media id ' + id);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#deleteById
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Deletes a media item with a given id
         *
         * ##usage
         * <pre>
         * mediaResource.deleteById(1234)
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre> 
         * 
         * @param {Int} id id of media item to delete        
         * @returns {Promise} resourcePromise object.
         *
         */
        deleteById: function(id) {
            return umbRequestHelper.resourcePromise(
                $http.delete(
                    umbRequestHelper.getApiUrl(
                        "mediaApiBaseUrl",
                        "DeleteById",
                        [{ id: id }])),
                'Failed to delete item ' + id);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getByIds
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Gets an array of media items, given a collection of ids
         *
         * ##usage
         * <pre>
         * mediaResource.getByIds( [1234,2526,28262])
         *    .then(function(mediaArray) {
         *        var myDoc = contentArray; 
         *        alert('they are here!');
         *    });
         * </pre> 
         * 
         * @param {Array} ids ids of media items to return as an array        
         * @returns {Promise} resourcePromise object containing the media items array.
         *
         */
        getByIds: function (ids) {
            
            var idQuery = "";
            _.each(ids, function(item) {
                idQuery += "ids=" + item + "&";
            });

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "mediaApiBaseUrl",
                       "GetByIds",
                       idQuery)),
               'Failed to retreive data for media ids ' + ids);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getScaffold
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Returns a scaffold of an empty media item, given the id of the media item to place it underneath and the media type alias.
         * 
         * - Parent Id must be provided so umbraco knows where to store the media
         * - Media Type alias must be provided so umbraco knows which properties to put on the media scaffold 
         * 
         * The scaffold is used to build editors for media that has not yet been populated with data.
         * 
         * ##usage
         * <pre>
         * mediaResource.getScaffold(1234, 'folder')
         *    .then(function(scaffold) {
         *        var myDoc = scaffold;
         *        myDoc.name = "My new media item"; 
         *
         *        mediaResource.save(myDoc, true)
         *            .then(function(media){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre> 
         * 
         * @param {Int} parentId id of media item to return
         * @param {String} alias mediatype alias to base the scaffold on        
         * @returns {Promise} resourcePromise object containing the media scaffold.
         *
         */
        getScaffold: function (parentId, alias) {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "mediaApiBaseUrl",
                       "GetEmpty",
                       [{ contentTypeAlias: alias }, { parentId: parentId }])),
               'Failed to retreive data for empty media item type ' + alias);

        },

        rootMedia: function () {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "mediaApiBaseUrl",
                       "GetRootMedia")),
               'Failed to retreive data for root media');

        },

        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#getChildren
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Gets children of a media item with a given id
         *
         * ##usage
         * <pre>
         * mediaResource.getChildren(1234, {pageSize: 10, pageNumber: 2})
         *    .then(function(contentArray) {
         *        var children = contentArray; 
         *        alert('they are here!');
         *    });
         * </pre> 
         * 
         * @param {Int} parentid id of content item to return children of
         * @param {Object} options optional options object
         * @param {Int} options.pageSize if paging data, number of nodes per page, default = 0
         * @param {Int} options.pageNumber if paging data, current page index, default = 0
         * @param {String} options.filter if provided, query will only return those with names matching the filter
         * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Ascending`
         * @param {String} options.orderBy property to order items by, default: `SortOrder`
         * @returns {Promise} resourcePromise object containing an array of content items.
         *
         */
        getChildren: function (parentId, options) {

            var defaults = {
                pageSize: 0,
                pageNumber: 0,
                filter: '',
                orderDirection: "Ascending",
                orderBy: "SortOrder"
            };
            if (options === undefined) {
                options = {};
            }
            //overwrite the defaults if there are any specified
            angular.extend(defaults, options);
            //now copy back to the options we will use
            options = defaults;
            //change asc/desct
            if (options.orderDirection === "asc") {
                options.orderDirection = "Ascending";
            }
            else if (options.orderDirection === "desc") {
                options.orderDirection = "Descending";
            }

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "mediaApiBaseUrl",
                       "GetChildren",
                       [
                           { id: parentId },
                           { pageNumber: options.pageNumber },
                           { pageSize: options.pageSize },
                           { orderBy: options.orderBy },
                           { orderDirection: options.orderDirection },
                           { filter: options.filter }
                       ])),
               'Failed to retreive children for media item ' + parentId);
        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#save
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Saves changes made to a media item, if the media item is new, the isNew paramater must be passed to force creation
         * if the media item needs to have files attached, they must be provided as the files param and passed seperately 
         * 
         * 
         * ##usage
         * <pre>
         * mediaResource.getById(1234)
         *    .then(function(media) {
         *          media.name = "I want a new name!";
         *          mediaResource.save(media, false)
         *            .then(function(media){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre> 
         * 
         * @param {Object} media The media item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing 
         * @param {Array} files collection of files for the media item      
         * @returns {Promise} resourcePromise object containing the saved media item.
         *
         */
        save: function (media, isNew, files) {
            return saveMediaItem(media, "save" + (isNew ? "New" : ""), files);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#addFolder
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Shorthand for adding a media item of the type "Folder" under a given parent ID
         *
         * ##usage
         * <pre>
         * mediaResource.addFolder("My gallery", 1234)
         *    .then(function(folder) {
         *        alert('New folder');
         *    });
         * </pre> 
         *
         * @param {string} name Name of the folder to create
         * @param {int} parentId Id of the media item to create the folder underneath         
         * @returns {Promise} resourcePromise object.
         *
         */
        addFolder: function(name, parentId){
            return umbRequestHelper.resourcePromise(
                $http.post(umbRequestHelper
                    .getApiUrl("mediaApiBaseUrl", "PostAddFolder"),
                    {
                        name: name,
                        parentId: parentId
                    }),
                'Failed to add folder');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.mediaResource#emptyRecycleBin
         * @methodOf umbraco.resources.mediaResource
         *
         * @description
         * Empties the media recycle bin
         *
         * ##usage
         * <pre>
         * mediaResource.emptyRecycleBin()
         *    .then(function() {
         *        alert('its empty!');
         *    });
         * </pre> 
         *         
         * @returns {Promise} resourcePromise object.
         *
         */
        emptyRecycleBin: function() {
            return umbRequestHelper.resourcePromise(
                $http.delete(
                    umbRequestHelper.getApiUrl(
                        "mediaApiBaseUrl",
                        "EmptyRecycleBin")),
                'Failed to empty the recycle bin');
        }
    };
}

angular.module('umbraco.resources').factory('mediaResource', mediaResource);

/**
    * @ngdoc service
    * @name umbraco.resources.mediaTypeResource
    * @description Loads in data for media types
    **/
function mediaTypeResource($q, $http, umbRequestHelper) {

    return {

        /**
         * @ngdoc method
         * @name umbraco.resources.mediaTypeResource#getAllowedTypes
         * @methodOf umbraco.resources.mediaTypeResource
         *
         * @description
         * Returns a list of allowed media types underneath a media item with a given ID
         *
         * ##usage
         * <pre>
         * mediaTypeResource.getAllowedTypes(1234)
         *    .then(function(array) {
         *        $scope.type = type;
         *    });
         * </pre> 
         * @param {Int} mediaId id of the media item to retrive allowed child types for
         * @returns {Promise} resourcePromise object.
         *
         */
        getAllowedTypes: function (mediaId) {

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "mediaTypeApiBaseUrl",
                       "GetAllowedChildren",
                       [{ contentId: mediaId }])),
               'Failed to retreive data for media id ' + mediaId);
        }

    };
}
angular.module('umbraco.resources').factory('mediaTypeResource', mediaTypeResource);
/**
    * @ngdoc service
    * @name umbraco.resources.memberResource
    * @description Loads in data for members
    **/
function memberResource($q, $http, umbDataFormatter, umbRequestHelper) {
    
    /** internal method process the saving of data and post processing the result */
    function saveMember(content, action, files) {
        
        return umbRequestHelper.postSaveContent({
            restApiUrl: umbRequestHelper.getApiUrl(
                "memberApiBaseUrl",
                "PostSave"),
            content: content,
            action: action,
            files: files,            
            dataFormatter: function(c, a) {
                return umbDataFormatter.formatMemberPostData(c, a);
            }
        });
    }

    return {
        
      
        /**
         * @ngdoc method
         * @name umbraco.resources.memberResource#getByKey
         * @methodOf umbraco.resources.memberResource
         *
         * @description
         * Gets a member item with a given key
         *
         * ##usage
         * <pre>
         * memberResource.getByKey("0000-0000-000-00000-000")
         *    .then(function(member) {
         *        var mymember = member; 
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @param {Guid} key key of member item to return        
         * @returns {Promise} resourcePromise object containing the member item.
         *
         */
        getByKey: function (key) {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "memberApiBaseUrl",
                       "GetByKey",
                       [{ key: key }])),
               'Failed to retreive data for member id ' + key);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.memberResource#deleteByKey
         * @methodOf umbraco.resources.memberResource
         *
         * @description
         * Deletes a member item with a given key
         *
         * ##usage
         * <pre>
         * memberResource.deleteByKey("0000-0000-000-00000-000")
         *    .then(function() {
         *        alert('its gone!');
         *    });
         * </pre> 
         * 
         * @param {Guid} key id of member item to delete        
         * @returns {Promise} resourcePromise object.
         *
         */
        deleteByKey: function (key) {
            return umbRequestHelper.resourcePromise(
                $http.delete(
                    umbRequestHelper.getApiUrl(
                        "memberApiBaseUrl",
                        "DeleteByKey",
                        [{ key: key }])),
                'Failed to delete item ' + key);
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.memberResource#getScaffold
         * @methodOf umbraco.resources.memberResource
         *
         * @description
         * Returns a scaffold of an empty member item, given the id of the member item to place it underneath and the member type alias.
         *         
         * - Member Type alias must be provided so umbraco knows which properties to put on the member scaffold 
         * 
         * The scaffold is used to build editors for member that has not yet been populated with data.
         * 
         * ##usage
         * <pre>
         * memberResource.getScaffold('client')
         *    .then(function(scaffold) {
         *        var myDoc = scaffold;
         *        myDoc.name = "My new member item"; 
         *
         *        memberResource.save(myDoc, true)
         *            .then(function(member){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre> 
         * 
         * @param {String} alias membertype alias to base the scaffold on        
         * @returns {Promise} resourcePromise object containing the member scaffold.
         *
         */
        getScaffold: function (alias) {
            
            if (alias) {
                return umbRequestHelper.resourcePromise(
                    $http.get(
                        umbRequestHelper.getApiUrl(
                            "memberApiBaseUrl",
                            "GetEmpty",
                            [{ contentTypeAlias: alias }])),
                    'Failed to retreive data for empty member item type ' + alias);
            }
            else {
                return umbRequestHelper.resourcePromise(
                    $http.get(
                        umbRequestHelper.getApiUrl(
                            "memberApiBaseUrl",
                            "GetEmpty")),
                    'Failed to retreive data for empty member item type ' + alias);
            }

        },
        
        /**
         * @ngdoc method
         * @name umbraco.resources.memberResource#save
         * @methodOf umbraco.resources.memberResource
         *
         * @description
         * Saves changes made to a member, if the member is new, the isNew paramater must be passed to force creation
         * if the member needs to have files attached, they must be provided as the files param and passed seperately 
         * 
         * 
         * ##usage
         * <pre>
         * memberResource.getBykey("23234-sd8djsd-3h8d3j-sdh8d")
         *    .then(function(member) {
         *          member.name = "Bob";
         *          memberResource.save(member, false)
         *            .then(function(member){
         *                alert("Retrieved, updated and saved again");
         *            });
         *    });
         * </pre> 
         * 
         * @param {Object} media The member item object with changes applied
         * @param {Bool} isNew set to true to create a new item or to update an existing 
         * @param {Array} files collection of files for the media item      
         * @returns {Promise} resourcePromise object containing the saved media item.
         *
         */
        save: function (member, isNew, files) {
            return saveMember(member, "save" + (isNew ? "New" : ""), files);
        }
    };
}

angular.module('umbraco.resources').factory('memberResource', memberResource);

/**
    * @ngdoc service
    * @name umbraco.resources.memberTypeResource
    * @description Loads in data for member types
    **/
function memberTypeResource($q, $http, umbRequestHelper) {

    return {

        //return all member types
        getTypes: function () {

            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "memberTypeApiBaseUrl",
                       "GetAllTypes")),
               'Failed to retreive data for member types id');
        }

    };
}
angular.module('umbraco.resources').factory('memberTypeResource', memberTypeResource);
/**
    * @ngdoc service
    * @name umbraco.resources.sectionResource
    * @description Loads in data for section
    **/
function sectionResource($q, $http, umbRequestHelper) {

    /** internal method to get the tree app url */
    function getSectionsUrl(section) {
        return Umbraco.Sys.ServerVariables.sectionApiBaseUrl + "GetSections";
    }
   
    //the factory object returned
    return {
        /** Loads in the data to display the section list */
        getSections: function () {
            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "sectionApiBaseUrl",
                       "GetSections")),
               'Failed to retreive data for sections');

		}
    };
}

angular.module('umbraco.resources').factory('sectionResource', sectionResource);

/**
    * @ngdoc service
    * @name umbraco.resources.stylesheetResource
    * @description service to retrieve available stylesheets
    * 
    *
    **/
function stylesheetResource($q, $http, umbRequestHelper) {

    //the factory object returned
    return {
        
        /**
         * @ngdoc method
         * @name umbraco.resources.stylesheetResource#getAll
         * @methodOf umbraco.resources.stylesheetResource
         *
         * @description
         * Gets all registered stylesheets
         *
         * ##usage
         * <pre>
         * stylesheetResource.getAll()
         *    .then(function(stylesheets) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @returns {Promise} resourcePromise object containing the stylesheets.
         *
         */
        getAll: function () {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "stylesheetApiBaseUrl",
                       "GetAll")),
               'Failed to retreive stylesheets ');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.stylesheetResource#getRules
         * @methodOf umbraco.resources.stylesheetResource
         *
         * @description
         * Returns all defined child rules for a stylesheet with a given ID
         *
         * ##usage
         * <pre>
         * stylesheetResource.getRules(2345)
         *    .then(function(rules) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @returns {Promise} resourcePromise object containing the rules.
         *
         */
        getRules: function (id) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "stylesheetApiBaseUrl",
                       "GetRules",
                       [{ id: id }]) +"&rnd=" + Math.floor(Math.random()*1001), {cache: false}),
               'Failed to retreive stylesheets ');
        },

        /**
         * @ngdoc method
         * @name umbraco.resources.stylesheetResource#getRulesByName
         * @methodOf umbraco.resources.stylesheetResource
         *
         * @description
         * Returns all defined child rules for a stylesheet with a given name
         *
         * ##usage
         * <pre>
         * stylesheetResource.getRulesByName("ie7stylesheet")
         *    .then(function(rules) {
         *        alert('its here!');
         *    });
         * </pre> 
         * 
         * @returns {Promise} resourcePromise object containing the rules.
         *
         */
        getRulesByName: function (name) {            
            return umbRequestHelper.resourcePromise(
               $http.get(
                   umbRequestHelper.getApiUrl(
                       "stylesheetApiBaseUrl",
                       "GetRulesByName",
                       [{ name: name }]) +"&rnd=" + Math.floor(Math.random()*1001), {cache: false}),
               'Failed to retreive stylesheets ');
        }
    };
}

angular.module('umbraco.resources').factory('stylesheetResource', stylesheetResource);

/**
    * @ngdoc service
    * @name umbraco.resources.treeResource
    * @description Loads in data for trees
    **/
function treeResource($q, $http, umbRequestHelper) {

    /** internal method to get the tree node's children url */
    function getTreeNodesUrl(node) {
        if (!node.childNodesUrl) {
            throw "No childNodesUrl property found on the tree node, cannot load child nodes";
        }
        return node.childNodesUrl;
    }
        
    /** internal method to get the tree menu url */
    function getTreeMenuUrl(node) {
        if (!node.menuUrl) {
            throw "No menuUrl property found on the tree node, cannot load menu";
        }
        return node.menuUrl;
    }

    //the factory object returned
    return {
        
        /** Loads in the data to display the nodes menu */
        loadMenu: function (node) {
              
            return umbRequestHelper.resourcePromise(
                $http.get(getTreeMenuUrl(node)),
                "Failed to retreive data for a node's menu " + node.id);
        },

        /** Loads in the data to display the nodes for an application */
        loadApplication: function (options) {

            if (!options || !options.section) {
                throw "The object specified for does not contain a 'section' property";
            }

            if(!options.tree){
                options.tree = "";
            }
            if (!options.isDialog) {
                options.isDialog = false;
            }
          
            //create the query string for the tree request, these are the mandatory options:
            var query = "application=" + options.section + "&tree=" + options.tree + "&isDialog=" + options.isDialog;

            //the options can contain extra query string parameters
            if (options.queryString) {
                query += "&" + options.queryString;
            }

            return umbRequestHelper.resourcePromise(
                $http.get(
                    umbRequestHelper.getApiUrl(
                        "treeApplicationApiBaseUrl",
                        "GetApplicationTrees",
                            query)),
                'Failed to retreive data for application tree ' + options.section);
        },
        
        /** Loads in the data to display the child nodes for a given node */
        loadNodes: function (options) {

            if (!options || !options.node) {
                throw "The options parameter object does not contain the required properties: 'node'";
            }

            return umbRequestHelper.resourcePromise(
                $http.get(getTreeNodesUrl(options.node)),
                'Failed to retreive data for child nodes ' + options.node.nodeId);
        }
    };
}

angular.module('umbraco.resources').factory('treeResource', treeResource);

})();