<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="uTagsy.ascx.cs" Inherits="uTagsy.Web.usercontrols.uTagsy.uTagsy" %>
<style type="text/css">
    /* containers */
    #uTagsy_leftCol, #uTagsy_middleCol, #uTagsy_rightCol { float: left; overflow: hidden; }
    #uTagsy_leftCol { padding-right: 30px; width: 200px;}
    #uTagsy_middleCol, #uTagsy_rightCol{padding-top:4px; overflow:hidden;}
    #uTagsy_middleCol{ height:20px; width: 100px;}
    #uTagsy_rightCol {width:300px}
    
    /* textbox*/
    #body_TabView1 .propertypane div.propertyItem #uTagsy input[type=text] { width: 200px; }
   
    /* dynamic tag list */
    #uTagsy_tags { list-style-type: none; }
    #uTagsy_tags li { padding-bottom: 5px; display: block; overflow: hidden; font-size:12px; }
    #uTagsy_tags a.uTagsy_delete { padding-right: 10px; text-decoration: none; }
    
    /* links */
    #uTagsy_add, #uTagsy_show_all, #uTagsy_hide_all { padding-left: 10px; text-decoration: none; color: #1541A9;}
    #uTagsy_add:hover, #uTagsy_show_all:hover, #uTagsy_hide_all:hover { text-decoration: underline; }
    #uTagsy_add{ float: right;}
    
    /* all tags */
    #uTagsy_tags_all { list-style-type: none; margin:0; overflow:hidden; padding:0; }
    #uTagsy_tags_all li { display: block; float:left; padding-right: 10px; padding-bottom: 5px;height:15px; overflow:hidden; }
    #uTagsy_tags_all a.uTagsy_global_tag {  text-decoration: none; font-size:12px; }
    #uTagsy_tags_all .uTagsy_global_tag:hover { text-decoration: underline; }
    
    #uTagsy_tags a, #uTagsy_tags_all a {color: #1541A9;}
    #uTagsy_tags a:hover { text-decoration:underline;}
    
    /* autocomplete dropdown - copied from umbraco's standard tag styles */
    .ac_results { background-color: #F0F0F0; border: 1px solid #979797; overflow: hidden; padding: 3px; z-index: 99999; }
    .ac_results ul { list-style: none outside none; margin: 0; padding: 0; width: 100%; }
    .ac_results li { color: #1A1818; cursor: pointer; display: block; height: 20px; line-height: 20px; overflow: hidden; padding: 2px 2px 2px 5px; }
    .ac_results .ac_over { background-color: #D5EFFC; border: 1px solid #A8D8EB; padding: 1px 1px 1px 4px !important; }
</style>

<script src="/umbraco_client/Application/JQuery/jquery.autocomplete.js?cdv=1" type="text/javascript" language="javascript"></script>

<script type="text/javascript">
    $(document).ready(function () {
        var uTagsy = new function () {
            this.tags = new Array();
            this.allTags = new Array();

            this.uTagsy_hfTags = $('input[id$=uTagsy_hfTags]');
            this.uTagsy_hfAllTags = $('input[id$=uTagsy_hfAllTags]');
            this.textbox = $('input[id$=uTagsy_txtTag]');

            // bind enter press event for textbox
            this.textbox.keypress(function (e) {
                if (e.keyCode == 13) {
                    $('#uTagsy_add').trigger('click');
                    return false;
                }
                return true;
            });

            //--
            // setup tags
            this.Init = function () {
                uTagsy.tags = [];
                uTagsy.allTags = [];

                console.log('get tags for this node');

                // get tags for this node
                var tagNames = uTagsy.uTagsy_hfTags.val().toString().trim().split(',');
                for (var i = 0; i < tagNames.length; i++) {
                    if (tagNames[i] == '') {
                        continue;
                    }
                    console.log('tag:' + tagNames[i]);
                    uTagsy.tags.push(tagNames[i]);
                    uTagsy.createTagForNode(tagNames[i]);
                }

                console.log('get all tags');
                // get tags for all nodes
                tagNames = uTagsy.uTagsy_hfAllTags.val().toString().trim().split(',');
                for (i = 0; i < tagNames.length; i++) {
                    console.log('tag:' + tagNames[i]);

                    if (tagNames[i] == '') {
                        continue;
                    }
                    uTagsy.allTags.push(tagNames[i]);
                    uTagsy.createTagForGlobal(tagNames[i]);

                    // add ',' separator for prettiness :)
                    if (i < tagNames.length - 1) {
                        $('#uTagsy_tags_all li:last').append(', ');
                    }
                }
                console.log('finished init');
            },
            //--
            // adds tag in current node's tag list
            this.createTagForNode = function (tag) {
                var link = $('<a class="uTagsy_delete" href="javascript:void(0);" rel="' + tag + '">[x]</a>').click(uTagsy.handleClickDelete);
                var listItem = $('<li></li>').append(link).append(tag).hide();
                $('#uTagsy_tags').append(listItem);
                $(listItem).fadeIn();
            },
            //--
            // adds tag to global tag list
            this.createTagForGlobal = function (tag) {
                var link = $('<a class="uTagsy_global_tag" href="javascript:void(0);" rel="' + tag + '">' + tag + '</a>').click(uTagsy.handleGlobalTagClick);
                var listItem = $('<li></li>').append(link);
                $('#uTagsy_tags_all').append(listItem);
            },
            //--
            // adds new tag to dom and tags array
            this.handleClickAdd = function () {
                // get tag from text box and trim
                var newTag = $.trim(uTagsy.textbox.val());

                // empty textbox, or tag already exists, so return
                if (newTag.length == 0 || $.inArray(newTag, uTagsy.tags) != -1) {
                    return false;
                }

                // add tag to array
                uTagsy.tags.push(newTag);

                // add tag to dom
                uTagsy.createTagForNode(newTag);

                // clear textbox
                uTagsy.textbox.val('');

                return false;
            },

            //--
            // deletes tag from dom and tag array
            this.handleClickDelete = function (sender) {
                // get tag name
                var tagToRemove = $(sender.target).attr('rel');

                // this check is probably redundant
                var tagIndex = $.inArray(tagToRemove, uTagsy.tags);

                if (tagIndex != -1) {
                    // remove from array
                    // note: tag index may be -1 if json file was deleted
                    uTagsy.tags.splice(tagIndex, 1);
                }

                // get index of clicked tag
                var index = $('.uTagsy_delete').index(sender.target);

                // remove tag from dom
                $('#uTagsy_tags li').eq(index).fadeOut(function () {
                    $(this).remove();
                });

                return false;
            },
            
            //--
            // fills in textbox and triggers click to add tag
            this.handleGlobalTagClick = function (sender) {
                // put value into textbox
                uTagsy.textbox.val($(sender.target).attr('rel'));

                // trigger click to add
                $('#uTagsy_add').trigger('click');
            },
            
            //--
            // Click event for uTagsy_add link
            $('#uTagsy_add').click(function () {
                uTagsy.handleClickAdd();
                return false;
            });


            //--
            // Click event for uTagsy_delete links
            $('.uTagsy_delete').click(function () {
                uTagsy.handleClickDelete(this);
                return false;
            });


            //--
            // Click event for uTagsy_show_all link to show all tags
            $('#uTagsy_show_all,#uTagsy_hide_all').click(function () {
                // show the tags
                $('#uTagsy_tags_all_container').toggle();
                $('#uTagsy_hide_all').toggle();
                $('#uTagsy_show_all').toggle();
                return false;
            });



            //--
            // Click event for uTagsy_global_tag link to add tag
            $('.uTagsy_global_tag').click(function () {
                handleGlobalTagClick(this);
                return false;
            });


            //--
            // Binds click event of save and publish buttons.
            // Constructs json string and saves to input for saving.
            $('input[id$=layer_save],input[id$=layer_publish],input[id$=body_UnPublishButton],input[id$=layer_topublish]').click(function () {
                // sort tags alphabetically
                uTagsy.tags.sort();

                // save umbracoValue
                uTagsy.uTagsy_hfTags.val(uTagsy.tags.join(","));
            });
        }; // end uTagsy

        uTagsy.Init();
        $('input[id$=uTagsy_txtTag]').autocomplete(uTagsy.tags);
    });
</script>

<div id="uTagsy">
    <asp:HiddenField ID="uTagsy_hfUmbracoValue" runat="server" />
    <asp:HiddenField ID="uTagsy_hfAllTags" runat="server" />
    <asp:HiddenField ID="uTagsy_hfTags" runat="server" />
    <div id="uTagsy_leftCol">
        <asp:TextBox ID="uTagsy_txtTag" runat="server"></asp:TextBox><a id="uTagsy_add"
            href="javascript:void(0)">Add</a>
        <ul id="uTagsy_tags">
            <%--<li><a class="uTagsy_delete" href="javascript:void(0)">[x]</a>asdf</li>--%>
        </ul>
    </div>
    <div id="uTagsy_middleCol">
        <a id="uTagsy_show_all" href="javascript:void(0)">Show all tags</a>
        <a id="uTagsy_hide_all" style="display:none;" href="javascript:void(0)">Hide tags</a>
    </div>
    <div id="uTagsy_rightCol">
        <div id="uTagsy_tags_all_container" style="display: none;">
            <ul id="uTagsy_tags_all">
                <%--<li><a class="uTagsy_global_tag" href="#" rel="sdf">sdf</a></li>--%>
            </ul>
        </div>
    </div>
</div>
