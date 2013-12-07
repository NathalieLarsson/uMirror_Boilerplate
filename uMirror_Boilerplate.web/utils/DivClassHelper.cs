using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace uMirror_Boilerplate.web.utils
{
	public static class DivClassHelper
	{
		public static string GetDivClass(int code)
		{
			switch(code)
			{
				case 1:
					return "theme-1";
				case 2: 
					return "theme-2";
				case 3:
					return "theme-3";
				case 4:
					return "theme-4";
				case 5:
					return "theme-5";
				default:
					return "theme-0";
			}
		}
	}
}