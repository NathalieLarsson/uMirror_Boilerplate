using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Core.Models;
using Umbraco.Web;
using ImageResizer;

namespace uMirror_Boilerplate.web.utils.Cropping
{
	public class SquareCrop
	{
		public static string SquareCropping(this UmbracoHelper umbracoHelper, IPublishedContent publishedContent){
			
			var r = new ResizeSettings();
			r.MaxWidth = 200;
			r.MaxHeight = 300;

			ImageBuilder.Current.Build("~/images/photo.jpg", "~/images/photo.jpg",
							   new ResizeSettings("width=100&height=200&crop=auto"));

			return null;

		}
	}
}