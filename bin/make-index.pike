#!/usr/bin/env pike
/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>

  Permission to copy, modify, and distribute this source for any legal
  purpose granted as long as my name is still attached to it. More
  specifically, the GPL, LGPL and MPL licenses apply to this software.
*/

constant md_args = ([
  "newline" : false
]);

constant html_template = combine_path(__DIR__, "..", "site", "template.html");
constant readme_md     = combine_path(__DIR__, "..", "README.md");
constant examples_dir  = combine_path(__DIR__, "..", "examples");
constant output_file   = combine_path(__DIR__, "..", "index.html");

constant BREAK_AFTER = 0;

int main(int argc, array(string) argv)
{
  string tmpl        = Stdio.read_file(html_template);
  string readme      = Stdio.read_file(readme_md);
  array(Token) parts = parse_html(readme);
  string out         = "";

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

  int i = 0;

  foreach (glob("*.tmpl", sort(get_dir(examples_dir))), string file) {
    string part = Stdio.read_file(combine_path(examples_dir, file));

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

    i += 1;

    if (BREAK_AFTER && i == BREAK_AFTER) {
      break;
    }
  }

  tmpl = replace(tmpl, "<!-- content -->", out);

  Stdio.write_file(output_file, tmpl);

  return 0;
}

int ntabs = 0;
string make_src_tab(array(Token) parts, string src)
{
  ntabs += 1;

  // werror("%O\n", parts);
  Token code = parts[0];
  Token tabt = parts[1];
  Token css;

  if (sizeof(parts) > 2) {
    css = parts[2];
  }

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
                aria-selected='false'>HTML</button>
      </li>";

  if (css) {
    tab_list += #"
      <li>
        <button id='tab-css-" + ntabs + #"' role='tab'
                aria-controls='tab-view-css-" + ntabs + #"'
                aria-selected='false'>CSS</button>
      </li>";
  }

  tab_list += "</ul>";


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

  string tab3;

  if (css) {
    mapping rep = ([
      "class='lang-" : "class='",
      " type=&quot;text/x-example&quot;" : ""
    ]);
    string csscode = src[css->start_pos..css->last_pos-1];
    csscode = replace(unindent(csscode), ([
      "<style type=\"text/x-example\">\n" : "",
      "\n</style>" : ""
    ]));

    string csscode_md = "```css" + csscode + "```";
    csscode_md = Tools.Markdown.parse(csscode_md, md_args);
    csscode_md = replace(csscode_md, rep);

    tab3 = #"
    <div aria-labelledby='tab-css-" + ntabs + #"'
       id='tab-view-css-" + ntabs + #"'
       role='tabpanel' aria-hidden='true'>" + csscode_md + "</div>";
  }

  string res = tab_list + tab1 + tab2;

  if (tab3) {
    res += tab3;
  }

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
    "catch", "catch(table)", "catch(code)", "catch(source)", "catch(tab)",
    "catch(css)" >);

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
        if (sizeof(stack)) {
          Token t = stack->pop();
          t->md = input[t->start_pos..s-1];
          t->end_pos = e;
          t->last_pos = s;
          out += ({ t });
        }
      }
    }, "--");

  p->finish(input);

  return out;
}
