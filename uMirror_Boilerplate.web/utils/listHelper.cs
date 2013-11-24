using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace uMirror_Boilerplate.web.utils
{
	public static class listHelper
	{
		// Get title from IPublishedContent
		public static string GetTitle(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent) 
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("listHeading"), publishedContent.GetPropertyValue("pageHeading"), publishedContent.Name);
		}

		// Get introduction from IPublishedContent
		public static string GetIntro( this UmbracoHelper umbracoHelper, IPublishedContent publishedContent )
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("listIntroduction"), publishedContent.GetPropertyValue("pageIntroduction"));
		}

		// Get content from IPublishedContent
		public static string GetContent( this UmbracoHelper umbracoHelper, IPublishedContent publishedContent )
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("pageContent"));
		}

		// Get content from IPublishedContent
		public static string GetUrl( this UmbracoHelper umbracoHelper, IPublishedContent publishedContent )
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("link"));
		}

		// Get datetime from IPublishedContent
		public static DateTime GetDate( this UmbracoHelper umbracoHelper, IPublishedContent publishedContent )
		{
			var listDate = Convert.ToDateTime(publishedContent.GetPropertyValue("listDate"));
			var pageDate = Convert.ToDateTime(publishedContent.GetPropertyValue("pageDate"));
			
			if(listDate < DateTime.MinValue){
				return listDate;
			} else {
				return pageDate;
			}
		}

		// Get image from IPublishedContent
		public static string GetImageUrl( this UmbracoHelper umbracoHelper, IPublishedContent publishedContent )
		{
			var image = umbracoHelper.Coalesce(publishedContent.GetPropertyValue("listImage"), publishedContent.GetPropertyValue("pageImage"));
			
			return image;
		}

		// Get icon from IPublishedContent
		public static string GetIconUrl(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent)
		{
			var image = umbracoHelper.Coalesce(publishedContent.GetPropertyValue("listIcon"), publishedContent.GetPropertyValue("pageIcon"));

			return image;
		}
	}
}