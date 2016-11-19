
int main(int argc, array(string) argv)
{
  string readme = Stdio.read_file(combine_path(__DIR__, "README.md"));

  readme = Tools.Markdown.parse(readme, ([ "newline" : false ]));

  Parser.HTML p = Parser.HTML();
  p->add_container("div", lambda (Parser.HTML pp, mapping a, string c) {
                            if (a->class && has_value(a->class, "intro")) {
                              #ifdef MKDEV
                              return "";
                              #else
                              return ({ "<div class='container intro'>" +
                                        "<div class='site-width'>" +
                                        readme + "</div></div>" });
                              #endif
                            }
                          });

  string html = Stdio.read_file(combine_path(__DIR__, "index.html"));
  html = p->finish(html)->read();

  Stdio.write_file("index.html", html);

  return 0;
}
