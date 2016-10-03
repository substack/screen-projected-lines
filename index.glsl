vec4 linevoffset (vec4 p, vec4 n, float direction, float aspect) { 
  vec2 sp = p.xy/p.w*vec2(aspect,1);
  vec2 sn = n.xy/n.w*vec2(aspect,1);
  vec2 dir = normalize(sn-sp);
  vec2 norm = dir.yx*vec2(-1.0/aspect,1);
  return vec4(direction*norm,0,0);
}
#pragma glslify: export(linevoffset)
