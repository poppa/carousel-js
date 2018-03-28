#!/usr/bin/env pike
/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>

  Permission to copy, modify, and distribute this source for any legal
  purpose granted as long as my name is still attached to it. More
  specifically, the GPL, LGPL and MPL licenses apply to this software.
*/

constant url = "https://placeholdit.imgix.net/~text";
constant out = combine_path(__DIR__, "..", "images");

mapping params = ([
  "txtsize" : "45",
  "txt"     : "Carousel.JS (%d:%s)",
  "w"       : "?",
  "h"       : "?",
  "bg"      : "?",
  "txtclr"  : "?"
]);

mapping colors = ([
  "E53DB5" : "ffffff",
  "E53D6F" : "ffffff",
  "E5473D" : "ffffff",
  "E5D93D" : "ffffff",
  "98E53D" : "ffffff",
  "3DE5E0" : "ffffff",
  "3D9EE5" : "ffffff",
  "4F3DE5" : "ffffff"
 ]);

mapping modes = ([
  "desktop" : ({ 1140, 680 }),
  "tablet"  : ({ 960, 540  }),
  "mobile"  : ({ 420, 600  })
]);


int main(int argc, array(string) argv)
{
  Protocols.HTTP.Query q;

  Standards.URI ruri = Standards.URI(url);

  mapping headers = ([
    "User-Agent" : "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1",
    "Host"       : ruri->host,
    "Connection" : "keep-alive",
    "Cache-Control" : "max-age=0",
    "Upgrade-Insecure-Requests" : "1"
  ]);

  // werror("headers: %O\n", headers);

  foreach (modes; string name; array(int) sizes) {
    mapping p = copy_value(params);
    p->w = (string) sizes[0];
    p->h = (string) sizes[1];

    int i = 1;
    string txt = p->txt;

    foreach (colors; string bg; string fg) {
      p->txt = sprintf(txt, i, name);
      p->bg = bg;
      p->txtclr = fg;

      string fname = "img-" + name + "-" + i + ".png";

      werror("Generating: %s...", fname);
      // werror("%s\n", url + "?" + (sprintf("%{%s=%s&%}", (array)p)));
      // exit(0);

      q = Protocols.HTTP.get_url(url, p, headers);

      if (q->status != 200) {
        werror("Bad HTTP status: %d\n", q->status);
        werror("%O\n", q->headers);
        exit(1);
      }

      Stdio.write_file(combine_path(out, fname), q->data());

      werror("Done!\n");

      // DOS protection ;)
      sleep(1);

      i += 1;
    }
  }

  return 0;
}
