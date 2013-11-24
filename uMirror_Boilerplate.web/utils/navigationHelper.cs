using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace uMirror_Boilerplate.web.utils
{
	public static class NavigationHelper
	{

		// check if the current node should be set as active.
		public static bool isActive(IPublishedContent node, IPublishedContent currentPage )
		{
			if (currentPage.Path.Split(',').Last().Equals(node.Id.ToString()))
			{
				return true;
			}

			if (currentPage.DocumentTypeAlias == "Homepage" && (node.GetPropertyValue("redirectToUrl") == "/" || node.GetPropertyValue("redirectToPage") == currentPage.Id.ToString()))
			{
				return true;
			}
			return false;
		}

		public static bool visibleChildren(IPublishedContent node, IPublishedContent currentPage )
		{
			if (node.Children.Where("umbracoNaviHide != true").Count() > 0)
			{
				return true;
			}

			return false;
		}

		public static string activeClass(IPublishedContent node, IPublishedContent currentPage )
		{
			if ((visibleChildren(node, currentPage)) && node.Url.ToString() == currentPage.Url.ToString())
			{
				return "active expanded";
			}
			else if (node.Url.ToString() == currentPage.Url.ToString())
			{
				return "active";
			}

			return string.Empty;
		}

		public static string navigationLevel( int code )
		{
			switch (code)
			{
				case 1:
					return "first-nav";
				case 2:
					return "second-nav";
				case 3:
					return "third-nav";
				case 4:
					return "fourth-nav";
				case 5:
					return "fifth-nav";
				default:
					return "other-nav";
			}

		}
	}
}