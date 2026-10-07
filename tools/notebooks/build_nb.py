import sys, pathlib, nbformat
from nbclient import NotebookClient
ROOT = pathlib.Path(__file__).resolve().parents[2]
def build(src):
    src = pathlib.Path(src); d = ROOT / "ml" / src.stem; d.mkdir(parents=True, exist_ok=True)
    nb = nbformat.v4.new_notebook(); cells, cur, md = [], [], False
    def flush():
        if not cur: return
        body = "\n".join(cur).strip("\n")
        if md: body = "\n".join(l[2:] if l.startswith("# ") else l.lstrip("#") for l in body.split("\n"))
        cells.append((nbformat.v4.new_markdown_cell if md else nbformat.v4.new_code_cell)(body))
    for line in src.read_text().split("\n"):
        if line.startswith("# %%"):
            flush(); cur = []; md = "[markdown]" in line
        else: cur.append(line)
    flush(); nb.cells = cells
    nb.metadata["kernelspec"] = {"name": "python3", "display_name": "Python 3", "language": "python"}
    NotebookClient(nb, timeout=900, kernel_name="python3", resources={"metadata": {"path": str(d)}}).execute()
    nbformat.write(nb, d / "train.ipynb"); print("built", d / "train.ipynb")
if __name__ == "__main__":
    for s in sys.argv[1:]: build(s)

