
constant md_args = ([
  "newline" : false
]);

int main(int argc, array(string) argv)
{
  string tmpl = Stdio.read_file("template.html");
  string readme = Stdio.read_file(combine_path(__DIR__, "README.md"));
  array(Token) parts = parse_html(readme);
  string out = "";

  foreach (parts, Token part) {
    string html = Tools.Markdown.parse(part->md, md_args);

    if (part->type == "catch(table)") {
      html = "<div class='scrollable'>" + html + "</div>";
    }
    else if (part->type == "catch(code)") {
      html = replace(html, "class='lang-", "class='");
    }

    out += html;
  }

  out = "<div class='container intro'><div class='site-width'>" + out + "</div></div>";

  foreach (glob("*.tmpl", sort(get_dir("examples"))), string file) {
    string part = Stdio.read_file(combine_path(__DIR__, "examples", file));

    if (part[-1] == '\n') {
      part = part[0..<1];
    }

    if (part[0] != '\n') {
      part = "\n" + part;
    }


    array(Token) pts = parse_html(part);

    if (sizeof(pts)) {
      // werror("Dude!: %O\n", pts);
      part = make_src_tab(pts, part);
    }

    out += part;
  }

  tmpl = replace(tmpl, "<!-- content -->", out);

  Stdio.write_file("index.html", tmpl);

  return 0;
}

int ntabs = 0;
string make_src_tab(array(Token) parts, string src)
{
  ntabs += 1;

  // werror("%O\n", parts);
  Token code = parts[0];
  Token tabt = parts[1];

  string tab_list = #"
    <ul role='tablist'>
      <li class='active'>
        <button id='tab-example-" + ntabs + #"' role='tab'
                aria-controls='tab-view-example-" + ntabs + #"'
                aria-selected='true'>Example</button>
      </li>
      <li>
        <button id='tab-code-" + ntabs + #"' role='tab'
                aria-controls='tab-view-code-" + ntabs + #"'
                aria-selected='false'>Source</button>
      </li>
    </ul>";

  string srccode = src[code->start_pos..code->last_pos-1];
  string srccode_md = "```html" + unindent(srccode) + "```";
  srccode_md = Tools.Markdown.parse(srccode_md, md_args);
  srccode_md = replace(srccode_md, "class='lang-", "class='");

  string example = src[tabt->start_pos .. tabt->last_pos-1];

  string tab1 = #"
    <div aria-labelledby='tab-example-" + ntabs + #"'
         id='tab-view-example-" + ntabs + #"'
         role='tabpanel' aria-hidden='false'>" + example + "</div>";

  string tab2 = #"
    <div aria-labelledby='tab-code-" + ntabs + #"'
         id='tab-view-code-" + ntabs + #"'
         role='tabpanel' aria-hidden='true'>" + srccode_md + "</div>";

  string res = tab_list + tab1 + tab2;

  string head = src[0..tabt->first_pos-1];
  string tail = src[tabt->end_pos..];

  res = head + res + tail;

  return res;
}

string unindent(string c) {
  array(string) pts = c/"\n";
  string ind;
  int indlen;

  foreach (pts, string pt) {
    if ((pt - " " - "\t") == "") {
      continue;
    }

    sscanf(pt, "%[\t ]<", ind);
    indlen = sizeof(ind);
    break;
  }

  array(string) out = ({});

  foreach (pts, string p) {
    if (has_prefix(p, ind)) {
      p = p[indlen..];
    }

    out += ({ p });
  }

  return out * "\n";
}

class Token {
  int start_pos,
    first_pos,
    end_pos,
    last_pos;
  string md, type;

  protected string _sprintf(int t)
  {
    return sprintf("Token(%s : %d > %d)", type, first_pos, end_pos);
  }
}

array(Token) parse_html(string input)
{
  multiset(string) start_keywords = (<
    "catch", "catch(table)", "catch(code)", "catch(source)", "catch(tab)" >);

  multiset(string) end_keywords = (<
    "endcatch" >);

  array(Token) out = ({});

  ADT.Stack stack = ADT.Stack();

  Parser.HTML p = Parser.HTML();

  p->add_quote_tag("!--",
    lambda (Parser.HTML pp, string data) {
      string d = String.trim_all_whites(data);
      int s = pp->at_char();
      int e = s + sizeof(data) + 7; // add length of <!---->

      if (start_keywords[d]) {
        Token t = Token();
        t->first_pos = s;
        t->start_pos = e;
        t->type  = d;

        stack->push(t);
      }
      else if (end_keywords[d]) {
        Token t = stack->pop();
        t->md = input[t->start_pos..s-1];
        t->end_pos = e;
        t->last_pos = s;
        out += ({ t });
      }
    }, "--");

  p->finish(input);

  return out;
}
