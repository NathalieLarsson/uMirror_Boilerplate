using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web;
using Umbraco.Core.Models;

namespace uMirror_Boilerplate.web.utils
{
	public static class pageHepler
	{
		public static string searchPageUrl(this UmbracoHelper umbracoHelper, IPublishedContent root)
		{
			var searchPageId = root.GetPropertyValue("searchPage");

			if (searchPageId != null)
			{
				string searchpage = umbracoHelper.TypedContent(searchPageId).Url;
				return searchpage;
			}

			return null;
		}
	}
}