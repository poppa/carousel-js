
constant md_args = ([
  "newline" : false
]);

int main(int argc, array(string) argv)
{
  string tmpl = Stdio.read_file("template.html");
  string data = readme_md();

  foreach (glob("*.tmpl", sort(get_dir("examples"))), string file) {
    string part = Stdio.read_file(combine_path(__DIR__, "examples", file));

    if (part[-1] == '\n') {
      part = part[0..<1];
    }

    if (part[0] != '\n') {
      part = "\n" + part;
    }

    data += part;
  }

  tmpl = replace(tmpl, "<!-- content -->", data);

  Stdio.write_file("index.html", tmpl);

#if 0
  readme = Tools.Markdown.parse(readme, md_args);

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
#endif

  return 0;
}

string readme_md()
{
  string readme = Stdio.read_file(combine_path(__DIR__, "README.md"));

  multiset(string) start_keywords = (<
    "catch", "catch(table)", "catch(code)" >);

  multiset(string) end_keywords = (<
    "endcatch" >);

  array(mapping) parts = ({});

  int start_pos = 0;
  string start_kw;

  Parser.HTML p = Parser.HTML();

  p->add_quote_tag("!--",
    lambda (Parser.HTML pp, string data) {
      string d = String.trim_all_whites(data);
      int s = pp->at_char();
      int e = s + sizeof(data) + 7; // add length of <!---->

      if (start_keywords[d]) {
        start_pos = e;
        start_kw = d;
      }
      else if (end_keywords[d]) {
        string part = readme[start_pos..s-1];
        parts += ({ ([ "type" : start_kw, "md" : part ]) });
      }
    }, "--");

  p->finish(readme);

  string out = "";

  foreach (parts, mapping part) {
    string html = Tools.Markdown.parse(part->md, md_args);

    if (part->type == "catch(table)") {
      html = "<div class='scrollable'>" + html + "</div>";
    }
    else if (part->type == "catch(code)") {
      html = replace(html, "class='lang-", "class='");
    }

    out += html;
  }

  return "<div class='container intro'><div class='site-width'>" + out + "</div></div>";
}
