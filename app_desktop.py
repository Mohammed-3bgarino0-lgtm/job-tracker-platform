import os
import sys
import webview

def start_desktop_app():
    # Get current directory path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    html_file = os.path.join(base_dir, "index.html")

    if not os.path.exists(html_file):
        print(f"Error: {html_file} not found!")
        return

    # Create native Windows Desktop GUI window
    window = webview.create_window(
        title="منصة التوظيف والتقديم التلقائي الشاملة | محمد السكران",
        url=html_file,
        width=1380,
        height=880,
        resizable=True,
        min_size=(900, 600)
    )
    
    webview.start()

if __name__ == "__main__":
    start_desktop_app()
