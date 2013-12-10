<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="Installer.ascx.cs" Inherits="uBlogsy.Web.usercontrols.uBlogsy.Dashboard.Installer" %>
<div>
    <asp:MultiView ID="MvInstall" runat="server" ActiveViewIndex="0">
        <asp:View runat="server">
            <h2>
                Important!</h2>
            <p>
                Click the button to finish the installation.</p>
            <asp:Button ID="Button1" runat="server" Text="Finish Installation" OnClick="Install_Click" />
            (Your application will restart)
        </asp:View>
        <asp:View ID="View2" runat="server">
            Done!
        </asp:View>
    </asp:MultiView>
</div>
