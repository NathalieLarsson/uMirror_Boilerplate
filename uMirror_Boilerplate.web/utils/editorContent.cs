using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace uMirror_Boilerplate.web.utils
{

	public static class editorContent
	{
		// Get title from IPublishedContent
		public static string GetPageHeading(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent)
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("listHeading"), publishedContent.GetPropertyValue("pageHeading"), publishedContent.Name);
		}

		// Get introduction from IPublishedContent
		public static string GetPageIntroduction(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent)
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("listIntroduction"), publishedContent.GetPropertyValue("pageIntroduction"));
		}

		// Get content from IPublishedContent
		public static string GetPageContent(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent)
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("pageContent"));
		}

		// Get image from IPublishedContent
		public static IPublishedContent GetPageImage(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent)
		{
			var image = publishedContent.GetPropertyValue("pageImage").ToString();
			return umbracoHelper.TypedMedia(image);
		}

		// Get content from IPublishedContent
		public static string GetPageUrl(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent)
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("link"));
		}

		// Get content from IPublishedContent
		public static string GetPageAuthor(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent)
		{
			return umbracoHelper.Coalesce(publishedContent.GetPropertyValue("link"));
		}

		// Get datetime from IPublishedContent
		public static DateTime GetPageDate(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent)
		{
			var listDate = Convert.ToDateTime(publishedContent.GetPropertyValue("listDate"));
			var pageDate = Convert.ToDateTime(publishedContent.GetPropertyValue("pageDate"));

			if (listDate < DateTime.MinValue)
			{
				return listDate;
			}
			else
			{
				return pageDate;
			}
		}
	}
}